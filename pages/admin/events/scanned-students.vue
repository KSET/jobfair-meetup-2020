<template>
  <app-max-width-container>
    <v-row>
      <v-col cols="12">
        <h1>Events | Scanned Students</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-btn
          :to="{ name: 'PageAdminEventsIndex' }"
          exact
        >
          <v-icon left>
            mdi-arrow-left
          </v-icon>
          Back
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-btn
          color="primary"
          target="_blank"
          :href="downloadAllUrl"
        >
          <v-icon left>
            mdi-download-multiple
          </v-icon>
          Skini popis svih skeniranih ({{ scanned.length }})
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="event in events"
        :key="event.id"
        cols="6"
        md="4"
      >
        <v-card>
          <v-card-title v-text="event.title" />

          <v-card-subtitle v-text="event.company.name" />

          <v-card-actions>
            <v-btn
              :href="downloadUrl(event)"
              color="primary"
              target="_blank"
            >
              <v-icon left>
                mdi-download
              </v-icon>
              Skini popis skeniranih ({{ usersForEventCount(event) }})
            </v-btn>

            <v-spacer />

            <v-btn
              icon
              @click="event.listOpen = !event.listOpen"
            >
              <v-icon>{{ event.listOpen ? "mdi-chevron-up" : "mdi-chevron-down" }}</v-icon>
            </v-btn>
          </v-card-actions>

          <v-expand-transition>
            <v-list
              v-show="event.listOpen"
              dense
            >
              <v-list-item
                v-for="user in usersForEvent(event)"
                :key="user.key"
              >
                <v-list-item-content>
                  <v-list-item-title v-text="user.name" />
                  <v-list-item-subtitle v-text="user.email" />
                  <v-list-item-subtitle v-text="user.scannedAt" />
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-expand-transition>
        </v-card>
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<router>
name: PageAdminEventsScannedStudents
</router>

<script>
  import {
    mapActions,
  } from "vuex";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";
  import {
    dotGet,
  } from "~/helpers/data";

  export default {

    components: {
      AppMaxWidthContainer,
    },

    async asyncData({ store }) {
      const addProp = (prop, value) => (obj) => Object.assign(obj, { [prop]: value });

      const [
        rawScanned,
        rawResumes,
        rawEvents,
      ] = await Promise.all([
        store.dispatch("events/fetchEventEntryListAll"),
        store.dispatch("resume/fetchResumes"),
        store.dispatch("companies/fetchParticipantEventsAll"),
      ]);

      const resumes = rawResumes;
      const scanned =
        rawScanned
          .sort(
            (a, b) =>
              a.scannedAt - b.scannedAt
            ,
          )
      ;
      const events =
        rawEvents
          .sort(
            (a, b) =>
              a.date - b.date
            ,
          )
          .map(addProp("listOpen", false))
      ;

      return {
        scanned,
        resumes,
        events,
      };
    },

    computed: {

      scannedForEvent() {
        const { scanned } = this;
        const eventParts = {};

        for (const { userId, eventId, eventType, scannedAt } of scanned) {
          if (!(eventId in eventParts)) {
            eventParts[eventId] = {};
          }

          if (!(eventType in eventParts[eventId])) {
            eventParts[eventId][eventType] = [];
          }

          eventParts[eventId][eventType].push({ userId, scannedAt });
        }

        return eventParts;
      },

      downloadAllUrl() {
        return "/api/events/entry-log/export/all.csv";
      },

    },

    methods: {
      ...mapActions({
        fetchScannedStudents: "events/fetchEventEntryListAll",
      }),

      usersForEvent(event) {
        const { resumes } = this;
        const list = dotGet(this.scannedForEvent, `${ event.id }.${ event.type }`, []);

        const findUser = (userId) => resumes.find(({ userId: id }) => String(id) === String(userId));

        return list.map(
          ({ userId, scannedAt: scannedAtRaw }) => {
            const scannedAt = new Date(scannedAtRaw).toLocaleDateString("hr-HR", {
              year: "numeric",
              month: "numeric",
              day: "numeric",

              hour: "numeric",
              minute: "numeric",
              second: "numeric",
            });

            const user = findUser(userId);

            if (!user) {
              return {
                scannedAt,
                name: userId,
                email: "?",
              };
            }

            return {
              scannedAt,
              name: user.fullName,
              email: user.email,
            };
          },
        );
      },

      usersForEventCount(event) {
        return dotGet(this.scannedForEvent, `${ event.id }.${ event.type }`, []).length;
      },

      downloadUrl(event) {
        return `/api/events/entry-log/export/${ event.type }/${ event.id }.csv`;
      },
    },
  };
</script>
