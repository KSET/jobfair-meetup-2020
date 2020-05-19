<template>
  <app-max-width-container>
    <h1>
      Sudionici
    </h1>
    <v-row>
      <v-col
        v-for="participant in participants"
        :key="participant.id"
        cols="6"
        md="3"
      >
        {{ participant.name }}
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<script>
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";

  export default {
    name: "PageSudionici",

    components: {
      AppMaxWidthContainer,
    },

    async asyncData({ store }) {
      return {
        participants: await store.dispatch("companies/fetchParticipants"),
      };
    },
  };
</script>
