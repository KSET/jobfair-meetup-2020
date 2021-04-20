<template>
  <v-card
    :class="$style.cardContainer"
    :to="noLink ? null : infoLink"
    flat
  >
    <v-img
      v-if="!isPanel"

      :lazy-src="company.thumbnail"
      :src="getSrcWithWidth(company.images, 400)"
      aspect-ratio="1.78"
      class="mx-6"
      contain
    />

    <v-carousel
      v-else

      :show-arrows="false"
      continuous
      cycle
      height="auto"
      hide-delimiters
      interval="3000"
      touchless
    >
      <v-carousel-item
        v-for="image in companyImageList"
        :key="`${ company.id }-${ image.src }`"
      >
        <v-img
          v-bind="image"
          aspect-ratio="1.78"
          class="mx-6"
          contain
        />
      </v-carousel-item>
    </v-carousel>

    <v-card-subtitle
      :class="$style.company"
      v-text="companyNameList"
    />

    <v-card-title
      :class="$style.title"
      :title="event.description"
    >
      <n-link
        v-if="noLink"
        :class="$style.titleLink"
        :to="infoLink"
        target="_blank"
        v-text="event.title"
      />
      <span
        v-else
        v-text="event.title"
      />
    </v-card-title>

    <v-card-text>
      <v-img
        :alt="capitalize(event.type)"
        :class="$style.icon"
        :src="icons[event.type]"
        :title="capitalize(event.type)"
        aspect-ratio="1"
        contain
      />
      <span
        :title="eventDate"
        v-text="eventDateText"
      />
    </v-card-text>

    <slot />
  </v-card>
</template>

<script>
  import {
    dotGet,
  } from "~/helpers/data";
  import {
    getSrcWithWidth,
  } from "~/helpers/image";
  import {
    capitalize,
  } from "~/helpers/string";

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
        const { event } = this;

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

      eventDate() {
        const date = new Date(this.event.date).toLocaleString("hr-HR");
        const location = this.event.location || "TBA";

        return `${ date } @ ${ location }`;
      },

      eventDateText() {
        return `${ this.eventDay } | ${ this.eventTime } | ${ this.event.location || "TBA" }`;
      },

      isPanel() {
        return "panel" === this.event.type;
      },

      companyNameList() {
        const { company, companies } = this.event;

        if (!this.isPanel) {
          return company.name;
        }

        return companies.map(({ info }) => info.name).join(", ");
      },

      companyImageList() {
        const { companies = [] } = this.event;

        return companies.filter(({ info }) => info && info.images).map(({ info: company }) => ({
          src: getSrcWithWidth(company.images, 400),
          "lazy-src": dotGet(company, "images.small.url"),
        }));
      },
    },

    methods: {
      getSrcWithWidth,

      capitalize,

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

      .titleLink {
        text-decoration: none;
        color: inherit;
      }
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
