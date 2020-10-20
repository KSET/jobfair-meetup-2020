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
            <basic-info-table
              :basic-info="basicInfo"
            />
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
              <a
                :href="qrImageSrc"
                target="_blank"
                title="QR kod za životopis"
              >
                <v-img
                  :src="qrImageSrc"
                  alt="QR kod za studenta"
                  aspect-ratio="1"
                  contain
                />
              </a>
            </v-col>
          </v-row>
        </v-row>
      </v-col>

      <v-col cols="12" md="8">
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

              <v-col cols="12">
                <v-row>
                  <v-col
                    v-for="filter in filterValues"
                    :key="filter.name"

                    :class="$style.filterContainer"
                    cols="auto"
                    class="d-flex px-0"
                  >
                    <v-btn
                      :class="{
                        [$style.filter]: true,
                        [$style.filterSelected]: filter.value === filterType
                      }"
                      text
                      tile
                      @click="filterType = filter.value"
                    >
                      <translated-text :trans-key="filter.name" />
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>

              <v-col v-if="events.length !== 0" cols="12">
                <v-row :class="$style.eventsContainer">
                  <v-col
                    v-for="event in events"
                    :key="event.id"
                    cols="12"
                    md="6"
                  >
                    <company-participant
                      :class="$style.cardContainer"
                      :event="event"
                      no-link
                    >
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

                            :disabled="isEventTypeDisabled(event, eventType)"

                            :ripple="false"
                            :value="eventType"
                            filter
                          >
                            <span
                              v-if="'event' === eventType"
                              class="text-capitalize"
                              v-text="event.type"
                            />
                            <translated-text
                              v-else
                              :trans-key="`studentPanel.event.status.${eventType}`"
                            />

                            <v-expand-x-transition>
                              <span v-if="!event.userStatus.includes(eventType)" class="ml-1">
                                <span :class="$style.parentheses">
                                  <span v-text="getEventTypeFreeSlots(event, eventType)" />
                                  <translated-text :trans-key="`studentPanel.event.slots.free`" />
                                </span>
                              </span>
                            </v-expand-x-transition>
                          </v-chip>
                        </v-chip-group>
                      </v-card-text>
                    </company-participant>
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

    <v-snackbar
      v-model="snackbar"
      bottom
      color="error"
      style="padding-bottom: 0;"
      timeout="-1"
      elevation="8"
    >
      {{ errorText }}

      <template v-slot:action="{ attrs }">
        <v-btn
          v-bind="attrs"
          color="white"
          icon
          text
          @click="snackbar = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </app-max-width-container>
</template>

<router>
name: PageStudentIndex
</router>

<script>
  import fuzzySearch from "fuzzysearch";
  import {
    mapActions,
    mapGetters,
  } from "vuex";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";
  import CompanyParticipant from "~/components/companies/CompanyParticipant";
  import BasicInfoTable from "~/components/student/resume/basic-info-table";
  import {
    EntryType,
  } from "~/components/student/resume/entry-type";
  import {
    eventListFromStatus,
    EventStatus,
    eventStatusForEvent,
    getParticipantCapacityFor,
  } from "~/components/student/event-status";
  import TranslatedText from "~/components/TranslatedText";
  import {
    dotGet,
  } from "~/helpers/data";

  const noParticipants = () => Object.fromEntries(Object.keys(EventStatus).map((k) => [ k, 0 ]));

  const getEventParticipants =
    (participants, { id, type }) =>
      dotGet(
        participants,
        `${ type }.${ id }`,
        noParticipants,
      )
  ;

  export default {
    name: "PageStudentIndex",

    components: {
      CompanyParticipant,
      TranslatedText,
      BasicInfoTable,
      AppMaxWidthContainer,
    },

    async asyncData({ store }) {
      const user = store.getters["user/getUser"];
      const eventStatuses = await store.dispatch("events/fetchEventStatusMine");
      const eventParticipants = await store.dispatch("events/fetchEventsParticipants");

      const getUserStatus =
        ({ id, type }) =>
          eventListFromStatus(
            dotGet(
              eventStatuses,
              `${ type }.${ id }`,
              0,
            ),
          )
      ;

      const eventParticipantsFor = getEventParticipants.bind(null, eventParticipants);

      const events =
        (await store.dispatch("companies/fetchParticipantEvents"))
          .sort((a, b) => a.date - b.date)
          .map((event) => ({
            ...event,
            userStatus: getUserStatus(event),
            participants: eventParticipantsFor(event),
            loading: false,
            maxParticipants: getParticipantCapacityFor(event.type),
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

        hasCv: user.uid,

        filterType: null,
        filterValue: "",
        searchFields: [
          "title",
          "location",
          "company.name",
        ],

        fetchInterval: null,

        snackbar: false,
        errorText: "",
      };
    },

    computed: {
      ...mapGetters({
        user: "user/getUser",
      }),

      qrImageSrc() {
        return `/api/image/qr-code/for-uid/${ encodeURIComponent(this.user.uid) }.svg`;
      },

      filteredEvents() {
        const { filterType, rawEvents } = this;

        if (!filterType) {
          return rawEvents;
        }

        if ("reserved" === filterType) {
          return rawEvents.filter(({ userStatus }) => userStatus.length);
        }

        return rawEvents.filter(({ type }) => type === filterType);
      },

      events() {
        return this.filterFunction(this.filteredEvents, this.filterValue);
      },

      filterValues() {
        return [
          {
            name: "participants.filter.all",
            value: null,
          },
          {
            name: "participants.filter.workshops",
            value: "workshop",
          },
          {
            name: "participants.filter.panels",
            value: "panel",
          },
          {
            name: "participants.filter.talks",
            value: "talk",
          },
          {
            name: "participants.filter.reserved",
            value: "reserved",
          },
        ];
      },
    },

    mounted() {
      if (!this.hasCv) {
        return;
      }

      this.fetchInterval = setInterval(async () => {
        const participants = await this.fetchEventsParticipants();

        for (const event of this.events) {
          this.$set(event, "participants", getEventParticipants(participants, event) || noParticipants());
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
          const { data, error, reason, errorData } = await this.doMarkEventStatus({ eventId: event.id, eventType: event.type, selected });

          if (error) {
            this.errorText =
              reason ||
              (
                errorData
                  ? errorData.join("\n")
                  : "Something went wrong"
              )
            ;
            this.snackbar = true;

            throw new Error(reason);
          }

          const { status } = data;
          this.$set(event, "userStatus", eventListFromStatus(status));
        } catch (e) {
          this.$sentry.captureException(e);
          this.$set(event, "userStatus", oldSelected);
        } finally {
          try {
            const participants = await this.fetchEventParticipants({ eventId: event.id, eventType: event.type });
            this.$set(event, "participants", participants);
          } catch {
          }

          event.loading = false;
        }
      },

      getEventStatus(event) {
        return eventStatusForEvent(event);
      },

      getEventTypeFreeSlots(event, eventType) {
        return Math.max(0, event.maxParticipants - event.participants[eventType]);
      },

      isEventTypeFull(event, eventType) {
        return 0 >= this.getEventTypeFreeSlots(event, eventType);
      },

      isEventTypeDisabled(event, eventType) {
        if (event.loading) {
          return true;
        }

        return (
          this.isEventTypeFull(event, eventType) &&
          !event.userStatus.includes(eventType)
        );
      },

      filterFunction(elements, query) {
        if (!query) {
          return elements;
        }

        const search =
          (object, key) =>
            fuzzySearch(
              query.toLowerCase(),
              String(dotGet(object, key, "")).toLowerCase(),
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

    .cardContainer {
      height: 100%;

      .parentheses {

        &::before {
          display: inline-block;
          content: "(";
        }

        &::after {
          display: inline-block;
          content: ")";
        }
      }
    }

    .filterContainer {
      justify-content: center;

      & + & {
        padding-left: 0;
      }

      .filter {
        $border-bottom-height: 2px;

        align-self: center;
        margin: 0 .8em;
        cursor: pointer;
        transition-timing-function: $transition-timing-function;
        transition-duration: 200ms;
        transition-property: opacity, border-bottom-color;
        opacity: .6;
        color: $fer-black;
        border-bottom: 2px solid transparent;

        &:hover {
          opacity: 1;
        }

        &.filterSelected {
          font-weight: bold;
          margin-bottom: 0;
          opacity: 1;
          color: $fer-dark-blue;
          border-bottom-color: $fer-black;
        }

        @include media(sm) {
          margin: 0 .3em;
          padding-right: .3em !important;
          padding-left: .3em !important;
        }
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
