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

              <v-col cols="12">
                <v-row>
                  <v-col
                    v-for="filter in filterValues"
                    :key="filter.name"

                    :class="$style.filterContainer"
                    class="d-flex px-2"
                    :cols="Math.round(12 / filterValues.length)"
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

                            :disabled="event.loading || event.participants[eventType] >= event.maxParticipants && !event.userStatus.includes(eventType)"

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
                                  <span>{{ event.maxParticipants - event.participants[eventType] }}</span>
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
  </app-max-width-container>
</template>

<script>
  import fuzzySearch from "fuzzysearch";
  import {
    mapActions,
  } from "vuex";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";
  import CompanyParticipant from "~/components/companies/CompanyParticipant";
  import BasicInfoValue from "~/components/student/basic-info-value";
  import {
    EntryType,
  } from "~/components/student/entry-type";
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
        noParticipants(),
      )
  ;

  export default {
    name: "PageStudentIndex",

    components: {
      CompanyParticipant,
      TranslatedText,
      BasicInfoValue,
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
      };
    },

    computed: {
      filteredEvents() {
        const { filterType, rawEvents } = this;

        if (!filterType) {
          return rawEvents;
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
        ];
      },
    },

    mounted() {
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
          const { status } = await this.doMarkEventStatus({ eventId: event.id, eventType: event.type, selected });
          this.$set(event, "userStatus", eventListFromStatus(status));
        } catch (e) {
          this.$sentry.captureException(e);
          this.$set(event, "userStatus", oldSelected);
        } finally {
          const participants = await this.fetchEventParticipants({ eventId: event.id, eventType: event.type });
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
              query.toLowerCase(),
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
          padding-right: .3em !important;
          padding-left: .3em !important;
          margin: 0 .3em;
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
