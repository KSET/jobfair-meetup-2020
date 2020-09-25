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
        <h1
          :class="$style.company"
          v-text="company.name"
        />
      </v-col>
    </v-row>

    <v-row class="mt-n4">
      <v-col
        class="my-4 my-md-0"
        cols="10"
        md="6"
        offset="1"
        offset-md="0"
      >
        <v-img
          :lazy-src="company.thumbnail"
          :src="company.image"
          aspect-ratio="1.78"
          contain
        />
      </v-col>

      <v-col
        :class="$style.aboutContainer"
        cols="12"
        md="6"
      >
        <h2 :class="$style.subTitle">
          <translated-text trans-key="participants.event.aboutCompany" />
        </h2>
        <p
          v-text="company.description"
        />
      </v-col>

      <v-col cols="12" md="6" offset-md="6">
        <h2 :class="$style.subTitle">
          <translated-text trans-key="participants.event.company.eventList" />
        </h2>
        <v-list>
          <v-list-item
            v-for="event in company.events"
            :key="event.id"

            :to="{ name: 'PageSudioniciInfo', params: { type: event.type, id: event.id } }"
            :title="capitalize(event.type)"
            three-line
          >
            <v-list-item-avatar tile>
              <v-img :src="icons[event.type]" />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="event.title" />
              <v-list-item-subtitle v-text="event.description" />
            </v-list-item-content>
          </v-list-item>
        </v-list>
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
  import {
    capitalize,
  } from "~/helpers/string";

  export default {
    name: "PageSudioniciCompanyInfo",

    components: {
      TranslatedText,
      AppMaxWidthContainer,
    },

    computed: {
      ...mapGetters({
        company: "companies/getCompany",
      }),

      icons() {
        return {
          talk: require("@/assets/images/icons/talk.png"),
          workshop: require("@/assets/images/icons/workshop.png"),
          panel: require("@/assets/images/icons/panel.png"),
        };
      },
    },

    methods: {
      capitalize(str) {
        return capitalize(str);
      },
    },

    async validate({ store, params }) {
      return await store.dispatch("companies/fetchInfo", { id: params.id });
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

    .aboutContainer {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .subTitle {
      font-size: 100%;
      font-weight: bold;
      margin-bottom: .5em;
      text-transform: uppercase;
      color: $fer-dark-blue;
    }
  }
</style>
