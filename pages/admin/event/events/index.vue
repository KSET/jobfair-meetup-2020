<template>
  <app-max-width-container :class="$style.container">
    <v-row>
      <v-col>
        <h1>Events</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-btn
          :to="{ name: 'PageAdminEventIndex' }"
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
      <v-col cols="12">
        <v-btn
          color="secondary"
          :to="{ name: 'PageAdminEventsScannedStudents' }"
        >
          <v-icon left>
            mdi-account-multiple-check
          </v-icon>
          Pristupnici eventima
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-header>Svi sudionici ({{ Object.keys(users).length }})</v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-chip
                v-for="user in users"
                :key="user.userId"
                :class="$style.eventUser"
                :title="user.email"
                label
                outlined
              >
                {{ user.fullName }}
              </v-chip>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-row v-if="rawEvents.length > 0">
          <v-col cols="8" md="9">
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
          <v-col cols="3" md="2">
            <v-select
              v-model="sortValue"
              :items="sortFields"
              dense
              label="Sort"
              outlined
            />
          </v-col>
          <v-col cols="1">
            <v-select
              v-model="sortDirection"
              :items="sortDirections"
              dense
              label="Direction"
              outlined
            />
          </v-col>

          <v-col cols="12">
            <v-row>
              <v-col
                v-for="filter in filterValues"
                :key="filter.name"

                :class="$style.filterContainer"
                :cols="Math.round(12 / filterValues.length)"
                class="d-flex px-2"
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
                v-for="event in sortedEvents"
                :key="event.id"

                cols="6"
                sm="4"
              >
                <company-participant
                  :event="event"
                  no-link
                >
                  <v-divider />

                  <v-expansion-panels class="pa-1 pt-3" popout>
                    <v-expansion-panel
                      v-for="eventType in getEventStatus(event)"
                      :key="eventType"
                      :disabled="event.participants[eventType].length === 0"
                    >
                      <v-expansion-panel-header>
                        <span
                          v-if="'event' === eventType"
                          class="text-capitalize"
                          v-text="event.type"
                        />
                        <translated-text
                          v-else
                          :trans-key="`studentPanel.event.status.${eventType}`"
                        />

                        <v-spacer />

                        <span class="text-right mr-3">
                          {{ event.participants[eventType].length }} / {{ event.maxParticipants }}
                        </span>
                      </v-expansion-panel-header>
                      <v-expansion-panel-content>
                        <v-chip
                          v-for="user in eventUsers(event.participants[eventType])"
                          :key="user.userId"
                          :class="$style.eventUser"
                          :title="user.email"
                          label
                          outlined
                        >
                          {{ user.fullName }}
                        </v-chip>
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                  </v-expansion-panels>
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
    </v-row>
  </app-max-width-container>
</template>

<router>
name: PageAdminEventsIndex
</router>

<script>
  import fuzzySearch from "fuzzysearch";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";
  import CompanyParticipant from "~/components/companies/CompanyParticipant";
  import {
    EventStatus,
    eventStatusForEvent,
    EventType,
    getParticipantCapacityFor,
  } from "~/components/student/event-status";
  import TranslatedText from "~/components/TranslatedText";
  import {
    dotGet,
  } from "~/helpers/data";

  const fetchParticipants =
    async (store) => {
      const { events: eventParticipants, users } = await store.dispatch("events/fetchEventsUserParticipants");

      return {
        eventParticipants,
        users,
      };
    }
  ;

  const noParticipants = () => Object.fromEntries(Object.keys(EventStatus).map((k) => [ k, [] ]));

  const sortDirections = [
    "⬇",
    "⬆",
  ];

  const sortFields = [
    "Date",
    "Participants",
  ];

  const userIdsFromEvents =
    (events) =>
      new Set(
        events
          .flatMap(({ participants }) => Object.values(participants))
          .flat()
        ,
      )
        .keys()
  ;

  const filterCurrentUsers =
    (events, users) =>
      Object.fromEntries(
        Array
          .from(userIdsFromEvents(events))
          .map((id) => [ id, users[id] ])
          .filter(([ , user ]) => user)
        ,
      )
  ;

  export default {
    name: "PageAdminEventsIndex",

    components: {
      TranslatedText,
      CompanyParticipant,
      AppMaxWidthContainer,
    },

    async asyncData({ store }) {
      const { eventParticipants, users } = await fetchParticipants(store);
      const eventList = (await store.dispatch("companies/fetchParticipantEventsAll")).sort((a, b) => a.date - b.date);

      const getParticipants = ({ type, id }) =>
        dotGet(
          eventParticipants,
          `${ type }.${ id }`,
          noParticipants,
        )
      ;

      const events = eventList.map(
        (event) =>
          ({
            ...event,
            participants: getParticipants(event),
            maxParticipants: getParticipantCapacityFor(event.type),
          })
        ,
      );

      return {
        rawEvents: events,
        users: filterCurrentUsers(events, users),

        filterType: null,
        filterValue: "",
        searchFields: [
          "title",
          "location",
          "company.name",
        ],

        sortDirection: sortDirections[0],
        sortValue: sortFields[0],
        sortDirections,
        sortFields,

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

      sortedEvents() {
        const participants =
          ({
            maxParticipants,
            participants: {
              event,
            },
          }) =>
            event.length / maxParticipants
        ;

        const date =
          ({
            date,
          }) =>
            date
        ;

        const compareFn = (() => {
          switch (this.sortValue) {
            case "Date":
              return date;
            case "Participants":
              return participants;
            default:
              return () => 1;
          }
        })();

        const direction = (() => {
          switch (this.sortDirection) {
            case "⬇":
              return -1;
            case "⬆":
              return 1;
          }
        })();

        return (
          [
            ...this.events,
          ]
            .sort(
              (a, b) =>
                (compareFn(b) - compareFn(a)) * direction
              ,
            )
        );
      },

      filterValues() {
        return [
          {
            name: "participants.filter.all",
            value: null,
          },
          {
            name: "participants.filter.workshops",
            value: EventType.workshop,
          },
          {
            name: "participants.filter.panels",
            value: EventType.panel,
          },
          {
            name: "participants.filter.talks",
            value: EventType.talk,
          },
        ];
      },
    },

    mounted() {
      this.fetchInterval = setInterval(async () => {
        const { eventParticipants, users } = await fetchParticipants(this.$store);

        const getParticipants = ({ type, id }) =>
          dotGet(
            eventParticipants,
            `${ type }.${ id }`,
            noParticipants,
          )
        ;

        this.$set(this, "users", filterCurrentUsers(this.rawEvents, users));

        for (const event of this.events) {
          this.$set(event, "participants", getParticipants(event));
          this.$set(event, "maxParticipants", getParticipantCapacityFor(event.type));
        }

        // for (const [ key, value ] of Object.entries(data)) {
        //   this.$set(this, key, value);
        // }
      }, 3000 + 4000 * Math.random());
    },

    beforeDestroy() {
      clearInterval(this.fetchInterval);
    },

    methods: {
      getEventStatus(event) {
        return eventStatusForEvent(event);
      },

      eventUsers(ids) {
        return ids.map((id) => this.users[id]).filter((x) => x);
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
  };
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  .container {

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

    .eventUser {
      $margin: 8px;

      margin-right: $margin;
      margin-bottom: $margin;

      &:last-child {
        margin-right: initial;
      }
    }

    .noEntries {
      font-weight: 300;
      margin-left: 1em;
      color: $fer-dark-blue;
    }
  }
</style>
