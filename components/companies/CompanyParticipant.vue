<template>
  <v-card
    :class="$style.cardContainer"
    :to="infoLink"
    flat
  >
    <v-img
      :lazy-src="company.thumbnail"
      :src="company.image"
      aspect-ratio="1.78"
      class="mx-6"
      contain
    />

    <v-card-subtitle :class="$style.company">
      {{ company.name }}
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
      {{ eventDay }} | {{ eventTime }} | {{ event.location || "TBA" }}
    </v-card-text>

    <slot />
  </v-card>
</template>

<script>
  export default {
    name: "CompanyParticipant",

    props: {
      event: {
        type: Object,
        required: true,
      },

      noLink: {
        type: Boolean,
        default() {
          return false;
        },
      },
    },

    computed: {
      icons() {
        return {
          talk: require("@/assets/images/icons/talk.png"),
          workshop: require("@/assets/images/icons/workshop.png"),
          panel: require("@/assets/images/icons/panel.png"),
        };
      },

      infoLink() {
        const { noLink, event } = this;

        if (noLink) {
          return null;
        }

        return { name: "PageSudioniciInfo", params: { type: event.type, id: event.id } };
      },

      company() {
        return this.event.company;
      },

      eventDay() {
        return this.weekday(this.event.date);
      },

      eventTime() {
        return this.time(this.event.date);
      },
    },

    methods: {
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
  };
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

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
</style>
