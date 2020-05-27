<template>
  <app-max-width-container :class="$style.container">
    <v-row>
      <v-col cols="12" md="6">
        <h2>
          <nuxt-link :class="$style.back" :to="{ name: 'PageSudionici' }">
            <v-icon>mdi-chevron-left</v-icon>
            Svi sudionici
          </nuxt-link>
        </h2>
      </v-col>

      <v-col class="d-flex flex-column" cols="12" md="6">
        <div class="ml-md-2">
          <h1
            :class="$style.company"
            v-text="eventObj.company.brand_name || eventObj.company.name"
          />
          <h3
            :class="$style.type"
            v-text="eventObj.type"
          />
        </div>
        <h4 :class="$style.info">
          <v-img
            :class="$style.icon"
            :src="icons[eventObj.type]"
            aspect-ratio="1"
            class="mr-2"
            contain
          />
          <span :class="$style.infoText">
            {{ eventObj.date | weekday }} | {{ eventObj.date | time }} | {{ eventObj.location || "TBA" }}
          </span>
        </h4>
      </v-col>
    </v-row>

    <v-row class="mt-n4">
      <v-col
        class="my-4 my-md-0"
        cols="10"
        md="6"
        offset-md="0"
        offset="1"
        order="2"
        order-md="1"
      >
        <v-img
          :lazy-src="eventObj.company.logo.small.url"
          :src="eventObj.company.logo.original.url"
          :srcset="eventObj.company.logo | srcSet"
          contain
          aspect-ratio="1.78"
        />
      </v-col>

      <v-col
        cols="12"
        md="6"
        order="1"
        order-md="2"
      >
        <h1
          :class="$style.title"
          v-text="eventObj.title || eventObj.name"
        />
        <p
          v-text="eventObj.description"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6" offset-md="6">
        <h2 :class="$style.about">
          <translated-text trans-key="participants.event.aboutCompany" />
        </h2>
        <p
          v-text="eventObj.company.short_description"
        />
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<script>
  import {
    mapGetters,
  } from "vuex";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";
  import TranslatedText from "~/components/TranslatedText";

  export default {
    name: "PageSudioniciInfo",

    components: {
      TranslatedText,
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

    computed: {
      ...mapGetters({
        rawEvent: "companies/getEvent",
      }),

      eventObj() {
        const { occures_at, ...event } = this.rawEvent;

        return {
          ...event,
          date: new Date(occures_at),
          type: this.$route.params.type,
        };
      },

      icons() {
        return {
          talk: require("@/assets/images/icons/talk.svg?inline"),
          workshop: require("@/assets/images/icons/workshop.svg?inline"),
          panel: require("@/assets/images/icons/panel.svg?inline"),
        };
      },
    },

    validate({ store, params }) {
      return store.dispatch("companies/fetchEvent", { id: params.id, type: params.type });
    },
  };
</script>

<style lang="scss" module>
  @import "../../../assets/styles/include/all";

  .container {
    margin-top: 3em;

    .back {
      font-size: 1rem;
      font-weight: bold;
      text-decoration: none;
      color: $fer-dark-blue;

      :global(.v-icon) {
        color: inherit;
      }
    }

    .company {
      font-size: 250%;
      font-weight: 800;
      color: $fer-dark-blue;
    }

    .type {
      font-size: 100%;
      font-weight: bold;
      margin-top: .8em;
      margin-left: .5em;
      text-transform: uppercase;
      color: $fer-dark-blue;

      @include media(md) {
        margin-top: .2em;
        margin-left: .25em;
      }
    }

    .info {
      font-size: 1rem;
      font-weight: normal;
      margin-top: 4em;
      color: $fer-black;

      @include media(md) {
        margin-top: .8em;
      }

      .icon {
        top: .2em;
        display: inline-block;
        width: 1.2em;
        height: 1.2em;
      }

      .infoText {
        opacity: .7;
      }
    }

    .title {
      font-size: 187.5%;
      font-weight: bold;
      margin-bottom: .35em;
      color: $fer-dark-blue;

      @include media(md) {
        font-size: 137.5%;
      }
    }

    .about {
      font-size: 100%;
      font-weight: bold;
      margin-bottom: .5em;
      text-transform: uppercase;
      color: $fer-dark-blue;
    }
  }
</style>
