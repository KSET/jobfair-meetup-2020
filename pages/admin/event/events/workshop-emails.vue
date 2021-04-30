<template>
  <app-max-width-container>
    <v-row>
      <v-col>
        <h1>Workshop emailovi</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
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
      <v-col
        v-for="{id, title, company, users, maxParticipants} in events"
        :key="id"

        cols="6"
        sm="4"
      >
        <v-expansion-panels class="pa-1 pt-3" popout>
          <v-expansion-panel>
            <v-expansion-panel-header>
              [{{ company }}]
              <br>
              {{ title }}
              <br>
              ({{ users.length }} / {{ maxParticipants }})
            </v-expansion-panel-header>

            <v-expansion-panel-content
              class="pa-3"
              style="white-space: break-spaces;"
              v-text="users.join(',\n')"
            />
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<router>
name: PageAdminEventsWorkshopEmails
</router>

<script>
  import map from "lodash/fp/map";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";
  import {
    EventType,
    getParticipantCapacityFor,
  } from "~/components/student/event-status";

  export default {
    components: {
      AppMaxWidthContainer,
    },

    async asyncData({ store }) {
      const workshopParticipants = getParticipantCapacityFor(EventType.workshop);

      /**
       * @type {Array<FormattedEvent>}
       */
      const rawEvents = await store.dispatch("companies/fetchEventReservationsFor", { type: "workshop" });

      return {
        events: map(
          /**
           * @param event {FormattedEvent}
           */
          (event) => ({
            ...event,
            users: map(({ name, email }) => `${ name } <${ email }>`)(event.users),
            maxParticipants: workshopParticipants,
          }),
        )(rawEvents),
      };
    },
  };
</script>
