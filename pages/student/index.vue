<template>
  <app-max-width-container :class="$style.container">
    <v-row>
      <v-col cols="12" md="4">
        <v-row>
          <v-col cols="12">
            <h2 :class="$style.sectionTitle">
              <translated-text trans-key="studentPanel.basicInfo.title" />
            </h2>
          </v-col>

          <v-col class="py-0" cols="12">
            <v-divider />
          </v-col>

          <v-col cols="12">
            <table :class="[$style.section, $style.sectionTable]">
              <tbody>
                <tr
                  v-for="(value, key) in basicInfo"
                  :key="`basicInfo:${key}`"
                >
                  <td>
                    <translated-text
                      :class="$style.sectionKey"
                      :trans-key="`studentPanel.basicInfo.${key}`"
                    />
                  </td>

                  <td>
                    <basic-info-value
                      :class="$style.sectionValue"
                      :entry="value"
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            <v-row :class="[$style.section, $style.sectionStaggered]">
              <v-col
                v-for="(value, key) in basicInfo"
                :key="`basicInfo:${key}`"
                cols="12"
              >
                <div>
                  <translated-text
                    :class="$style.sectionKey"
                    :trans-key="`studentPanel.basicInfo.${key}`"
                  />
                </div>

                <div>
                  <basic-info-value
                    :class="$style.sectionValue"
                    :entry="value"
                  />
                </div>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <v-row v-if="hasCv">
          <v-col cols="12">
            <h2 :class="$style.sectionTitle">
              <translated-text trans-key="studentPanel.basicInfo.qrCode" />
            </h2>
          </v-col>

          <v-col class="py-0" cols="12">
            <v-divider />
          </v-col>

          <v-row style="width: 100%;">
            <v-col cols="12">
              <v-img
                alt="QR kod za studenta"
                aspect-ratio="1"
                contain
                src="/api/image/qr-code/for-user/qr.png"
              />
            </v-col>
          </v-row>
        </v-row>
      </v-col>

      <v-col cols="11" md="8">
        <v-row>
          <v-col cols="12">
            <h2 :class="$style.sectionTitle">
              <translated-text trans-key="participants.header" />
            </h2>
          </v-col>

          <v-col class="py-0" cols="12">
            <v-divider />
          </v-col>

          <v-col v-if="hasCv" cols="12">
            <v-row v-if="rawEvents.length > 0">
              <v-col cols="12">
                <v-text-field
                  v-model="filterValue"
                  :class="$style.search"
                  clearable
                  color="secondary"
                  dense
                  hide-details
                  label="Search"
                  outlined
                  prepend-inner-icon="mdi-magnify"
                />
              </v-col>

              <v-col v-if="events.length !== 0" cols="12">
                <v-row :class="$style.eventsContainer">
                  <v-col
                    v-for="event in events"
                    :key="event.id"
                    cols="12"
                    md="6"
                  >
                    <v-card
                      :class="$style.cardContainer"
                      :loading="event.loading"
                      flat
                    >
                      <v-img
                        :lazy-src="event.company.logo.small.url"
                        :src="event.company.logo.original.url"
                        :srcset="event.company.logo | srcSet"
                        aspect-ratio="1.78"
                        class="mx-6"
                        contain
                      />
                      <v-card-subtitle :class="$style.company">
                        {{ event.company.name }}
                      </v-card-subtitle>

                      <v-card-title :class="$style.title">
                        {{ event.title }}
                      </v-card-title>

                      <v-card-text>
                        <v-img
                          :class="$style.icon"
                          :src="icons[event.type]"
                          aspect-ratio="1"
                          contain
                        />
                        {{ event.date | weekday }} | {{ event.date | time }} | {{ event.location || "TBA" }}
                      </v-card-text>

                      <v-divider class="mx4" />

                      <v-card-subtitle class="pb-0 pt-3">
                        <translated-text trans-key="studentPanel.event.selectStatus" />
                      </v-card-subtitle>

                      <v-card-text>
                        <v-chip-group
                          v-model="event.userStatus"
                          active-class="primary secondary--text"
                          column
                          multiple
                          @change.capture="captureSelection(event, $event)"
                        >
                          <v-chip
                            v-for="eventType in getEventStatus(event)"
                            :key="eventType"

                            :disabled="event.loading || event.participants[eventType] >= maxParticipants && !event.userStatus.includes(eventType)"

                            :ripple="false"
                            :value="eventType"
                            filter
                          >
                            <translated-text :trans-key="`studentPanel.event.status.${eventType}`" />
                            <v-expand-x-transition>
                              <span v-if="!event.userStatus.includes(eventType)" class="ml-1">
                                ({{ maxParticipants - event.participants[eventType] }}
                                <translated-text :trans-key="`studentPanel.event.slots.free`" />
                                )
                              </span>
                            </v-expand-x-transition>
                          </v-chip>
                        </v-chip-group>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>

              <v-col v-else cols="12">
                <h2 :class="$style.noEntries">
                  <translated-text trans-key="participants.filter.noEntries" />
                </h2>
              </v-col>
            </v-row>

            <h2 v-else :class="$style.noEntries">
              <translated-text trans-key="participants.no-participants" />
            </h2>
          </v-col>
          <v-col v-else>
            <h2 :class="$style.noEntries">
              <translated-text trans-key="studentPanel.noCv" />
            </h2>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<script>
  import fuzzySearch from "fuzzysearch";
  import {
    mapActions,
  } from "vuex";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";
  import BasicInfoValue from "~/components/student/basic-info-value";
  import {
    EntryType,
  } from "~/components/student/entry-type";
  import {
    eventListFromStatus,
    EventStatus,
    eventStatusForEvent,
    MAX_PARTICIPANTS,
  } from "~/components/student/event-status";
  import TranslatedText from "~/components/TranslatedText";
  import {
    dotGet,
  } from "~/helpers/data";

  const noParticipants = () => Object.fromEntries(Object.keys(EventStatus).map((k) => [ k, 0 ]));

  export default {
    name: "PageStudentIndex",

    components: {
      TranslatedText,
      BasicInfoValue,
      AppMaxWidthContainer,
    },

    filters: {
      srcSet(image) {
        return (
          Object
            .values(image)
            .map(
              ({ width, url }) =>
                `${ url } ${ width }w`
              ,
            )
            .join(",")
        );
      },

      weekday(date) {
        const days = [
          "nedjelja",
          "ponedjeljak",
          "utorak",
          "srijeda",
          "četvrtak",
          "petak",
          "subota",
        ];
        const dateObj = new Date(date);

        return days[dateObj.getDay()];
      },

      time(date) {
        const dateObj = new Date(date);
        const zeroPad = (n) => String(n).padStart(2, "0");
        return `${ zeroPad(dateObj.getHours()) }:${ zeroPad(dateObj.getMinutes()) }`;
      },
    },

    async asyncData({ store }) {
      const user = store.getters["user/getUser"];
      const eventStatuses = await store.dispatch("events/fetchEventStatusMine");
      const eventParticipants = await store.dispatch("events/fetchEventsParticipants");

      const getUserStatus =
        ({ id }) =>
          eventListFromStatus(eventStatuses[id])
      ;

      const getEventParticipants =
        ({ id }) =>
          eventParticipants[id] || noParticipants()
      ;

      const events =
        (await store.dispatch("companies/fetchParticipantEvents"))
          .sort((a, b) => a.date - b.date)
          .map((event) => ({
            ...event,
            userStatus: getUserStatus(event),
            participants: getEventParticipants(event),
            loading: false,
          }))
      ;

      const basicInfo = Object.fromEntries(Object.entries({
        fullName: {
          text: user.name,
        },
        city: {
          text: user.city,
        },
        birthday: {
          text: user.birthday,
          type: EntryType.Date,
        },
        phone: {
          text: user.phone,
          type: EntryType.Phone,
        },
        email: {
          text: user.email,
          type: EntryType.Email,
        },
        githubUrl: {
          text: user.githubUrl,
          type: EntryType.Url,
        },
        linkedinUrl: {
          text: user.linkedinUrl,
          type: EntryType.Url,
        },
      }).filter(([ , { text } ]) => text));

      return {
        basicInfo,
        rawEvents: events,
        maxParticipants: MAX_PARTICIPANTS,

        hasCv: user.uid,

        filterValue: "",
        searchFields: [
          "title",
          "location",
          "company.name",
        ],

        fetchInterval: null,
      };
    },

    computed: {
      icons() {
        return {
          talk: require("@/assets/images/icons/talk.png"),
          workshop: require("@/assets/images/icons/workshop.png"),
          panel: require("@/assets/images/icons/panel.png"),
        };
      },

      events() {
        return this.filterFunction(this.rawEvents, this.filterValue.toLowerCase());
      },
    },

    mounted() {
      this.fetchInterval = setInterval(async () => {
        const participants = await this.fetchEventsParticipants();

        for (const event of this.events) {
          this.$set(event, "participants", participants[event.id] || noParticipants());
        }
      }, 8000 + 4000 * Math.random());
    },

    beforeDestroy() {
      clearInterval(this.fetchInterval);
    },

    methods: {
      ...mapActions({
        doMarkEventStatus: "events/markEventStatus",
        fetchEventParticipants: "events/fetchEventParticipants",
        fetchEventsParticipants: "events/fetchEventsParticipants",
      }),

      async captureSelection(event, selected) {
        event.loading = true;
        const oldSelected = [ ...event.userStatus ];

        try {
          const { status } = await this.doMarkEventStatus({ eventId: event.id, selected });
          this.$set(event, "userStatus", eventListFromStatus(status));
        } catch {
          this.$set(event, "userStatus", oldSelected);
        } finally {
          const participants = await this.fetchEventParticipants({ eventId: event.id });
          this.$set(event, "participants", participants);

          event.loading = false;
        }
      },

      getEventStatus(event) {
        return eventStatusForEvent(event);
      },

      filterFunction(elements, query) {
        if (!query) {
          return elements;
        }

        const search =
          (object, key) =>
            fuzzySearch(
              query,
              String(dotGet(object, key) || "").toLowerCase(),
            )
        ;

        const { searchFields } = this;

        return (
          elements.filter(
            (event) =>
              searchFields
                .find(
                  (field) =>
                    search(event, field)
                  ,
                )
            ,
          )
        );
      },
    },

    head() {
      return {
        title: "Student Portal",
      };
    },
  };
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  .container {

    .sectionTitle {
      font-weight: bold;
      margin-bottom: -.2em;
      color: $fer-dark-blue;
    }

    .section {

      &.sectionTable {
        display: table;
        margin: -1.5em 0;
        border-spacing: 0 1.5em;
        border-collapse: separate;

        @include media(sm) {
          display: none;
        }
      }

      &.sectionStaggered {
        display: none;

        @include media(sm) {
          display: block;
        }
      }

      .sectionKey,
      .sectionValue {
        font-weight: 600;
        color: $fer-black;
      }

      .sectionKey {
        margin-right: 4em;
        text-transform: uppercase;
        opacity: .6;
      }

      .sectionValue {
        opacity: .8;
      }
    }

    .cardContainer {
      height: 100%;

      .company {
        font-size: 100%;
        font-weight: normal;
        padding-top: .5em;
        padding-bottom: 0;
        text-transform: uppercase;
        opacity: .7;
        color: $fer-black;
      }

      .title {
        font-size: 112.5%;
        font-weight: bold;
        padding-top: 0;
        padding-bottom: 0;
        color: $fer-dark-blue;
      }

      .icon {
        position: relative;
        top: .25em;
        display: inline-block;
        width: 1.2em;
        height: 1.2em;
      }
    }

    .eventsContainer {
      overflow-y: scroll;
      min-height: 420px;
      max-height: 60vh;
    }

    .noEntries {
      font-weight: 300;
      margin-left: 1em;
      color: $fer-dark-blue;
    }
  }
</style>
