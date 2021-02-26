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
          :href="downloadAllUrl"
          color="primary"
          target="_blank"
        >
          <v-icon left>
            mdi-download-multiple
          </v-icon>
          Skini popis svih skeniranih ({{ scanned.length }})
        </v-btn>
      </v-col>

      <v-spacer />

      <v-col class="text-right">
        <v-dialog
          v-model="addEntry.dialog"
          max-width="600px"
          persistent
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              color="primary"
              v-on="on"
              @click.stop="openAddEntry"
            >
              <v-icon left>
                mdi-account-plus
              </v-icon>
              Dodaj sudionika ručno
            </v-btn>
          </template>

          <v-card
            :loading="addEntry.loading"
          >
            <v-card-title>
              <span class="headline">Dodaj polaznika manualno</span>
            </v-card-title>

            <v-card-text>
              <v-form
                v-model="addEntry.valid"
                :disabled="addEntry.loading"
              >
                <v-row>
                  <v-col
                    cols="12"
                  >
                    <v-autocomplete
                      v-model="addEntry.data.userId"
                      :filter="itemFilter('fullName', 'email')"
                      :items="resumes"
                      :rules="addEntryRules.student"
                      clearable
                      item-text="fullName"
                      item-value="userId"
                      label="Student"
                      required
                    />
                  </v-col>

                  <v-col
                    cols="12"
                  >
                    <v-autocomplete
                      v-model="addEntry.data.eventId"
                      :filter="itemFilter('title', 'company.name')"
                      :items="events"
                      :rules="addEntryRules.event"
                      clearable
                      item-text="title"
                      item-value="id"
                      label="Event"
                      required
                    />
                  </v-col>

                  <v-col
                    cols="12"
                  >
                    <v-time-picker
                      v-model="addEntry.data.time"
                      format="24hr"
                      full-width
                      landscape
                      scrollable
                    />
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>

            <v-card-actions>
              <v-btn
                color="blue darken-1"
                text
                @click="closeAddEntry"
              >
                Close
              </v-btn>

              <v-spacer />

              <v-btn
                :disabled="!addEntryValid"
                :loading="addEntry.loading"
                color="blue darken-1"
                text
                @click="submitAddEntry"
              >
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
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
  import fuzzySearch from "fuzzysearch";
  import {
    mapActions,
  } from "vuex";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";
  import {
    dotGet,
  } from "~/helpers/data";

  const getData = async (store) => {
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
        .map((event) => Object.assign(event, { listOpen: false }))
    ;

    return {
      scanned,
      resumes,
      events,
    };
  };

  const rules = {
    required:
      (errorText = "Required") =>
        (value) =>
          (
            Boolean(value) ||
            errorText
          ),

    minLength:
      (length, errorText = "Required") =>
        (value) =>
          (
            length < String(value || "").length ||
            errorText
          )
    ,
  };

  export default {

    components: {
      AppMaxWidthContainer,
    },

    async asyncData({ store }) {
      return await getData(store);
    },

    data() {
      return {
        addEntry: {
          dialog: false,
          loading: true,
          search: "",

          valid: false,
          data: {
            userId: null,
            eventId: null,
            time: null,
          },
        },
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

      addEntryRules() {
        return {
          student: [
            rules.required("Required"),
          ],

          event: [
            rules.required("Required"),
          ],
        };
      },

      addEntryValid() {
        const { valid, data } = this.addEntry;

        return valid && data.time;
      },

    },

    methods: {
      ...mapActions({
        fetchScannedStudents: "events/fetchEventEntryListAll",
        logEventEntryManual: "events/logEventEntryManual",
        fetchResumes: "resume/fetchResumes",
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

      async refreshData() {
        const data = await getData(this.$store);

        for (const [ key, value ] of Object.entries(data)) {
          this.$set(this, key, value);
        }
      },

      async openAddEntry() {
        this.addEntry.loading = true;
        try {
          const resumes = await this.fetchResumes();
          this.$set(this, "resumes", resumes);
        } catch {
        }
        this.addEntry.loading = false;
      },

      clearAddEntry() {
        this.$set(this.addEntry, "data", {});
      },

      closeAddEntry() {
        this.addEntry.dialog = false;
        this.clearAddEntry();
      },

      async submitAddEntry() {
        const { data } = this.addEntry;
        const selectedEvent = this.events.find(({ id }) => String(data.eventId) === String(id));

        if (!selectedEvent) {
          return alert("Can't find event");
        }

        const [ hours, minutes ] = data.time.split(":");

        const eventDate = new Date(selectedEvent.date);

        eventDate.setHours(hours);
        eventDate.setMinutes(minutes);

        const payload = {
          userId: data.userId,
          eventId: selectedEvent.id,
          eventType: selectedEvent.type,
          eventDate: eventDate.toISOString(),
        };

        try {
          this.addEntry.loading = true;
          const { error, reason, errorData } = await this.logEventEntryManual(payload);

          if (error) {
            const err =
              reason ||
              (
                errorData
                  ? errorData.join("\n")
                  : "Something went wrong"
              )
            ;

            throw new Error(err);
          }

          await this.refreshData();
          this.clearAddEntry();
        } catch (e) {
          return alert(e);
        } finally {
          this.addEntry.loading = false;
        }
      },

      itemFilter(...searchFields) {
        const search =
          (object, key, queryText) =>
            fuzzySearch(
              queryText.toLowerCase(),
              String(dotGet(object, key, "")).toLowerCase(),
            )
        ;

        return (
          (resume, queryText) =>
            searchFields
              .flat()
              .find(
                (field) =>
                  search(resume, field, queryText)
                ,
              )
        );
      },
    },
  };
</script>
