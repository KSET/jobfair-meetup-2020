<template>
  <app-max-width-container :class="$style.container" class="mb-12">
    <v-row
      v-for="(categoryItems, category, i) in items"
      :key="category"
      :class="{
        'mt-8': i > 0,
      }"
    >
      <v-col cols="12">
        <v-row>
          <v-col cols="12">
            <h1
              :id="camelToKebabCase(category)"
              :class="$style.mainHeader"
            >
              <translated-text
                :trans-key="`qna.companyApplications.${category}.header`"
              />
            </h1>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="8" offset-md="2">
            <v-img
              :src="categoryImages[category]"
              aspect-ratio="1"
              contain
            />
          </v-col>
        </v-row>

        <v-row
          v-for="item in categoryItems"
          :key="item.id"
        >
          <v-col
            cols="12"
          >
            <h2
              :id="item.slug"
              :class="$style.header"
              v-text="item.question"
            />
            <p
              :class="$style.answer"
              v-text="item.answer"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<router>
name: PageQnACompanyApplications
</router>

<script>
  import {
    mapGetters,
  } from "vuex";
  import TranslatedText from "~/components/TranslatedText";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";
  import {
    camelToKebabCase,
  } from "~/helpers/string";

  export default {
    components: {
      TranslatedText,
      AppMaxWidthContainer,
    },

    async fetch({ store }) {
      await store.dispatch("qna/fetchAllCompanyApplicationItems");
    },

    data: () => ({
      categoryImages: {
        inGeneral: require("~/assets/images/q-n-a/company-applications/inGeneral.svg?inline"),
        aboutApplications: require("~/assets/images/q-n-a/company-applications/aboutApplications.svg?inline"),
        talksWorkshopsPanelsDiscussions: require("~/assets/images/q-n-a/company-applications/talksWorkshopsPanelsDiscussions.svg?inline"),
      },
    }),

    computed: {
      ...mapGetters({
        getTranslation: "translations/translation",
        items: "qna/getItems",
      }),
    },

    methods: {
      camelToKebabCase,
    },
  };
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  .container {
    $gap: 2.5em;

    max-width: 700px;
    margin: #{$gap} auto 0;

    .mainHeader {
      font-size: 250%;
      font-weight: 800;
      text-align: center;
      text-transform: uppercase;
      color: $fer-dark-blue;
    }

    .header {
      font-size: 162.5%;
      font-weight: bold;
      margin: .4em auto;
      color: $fer-dark-blue;

      > a {
        text-decoration: none;
        color: inherit;
      }
    }

    .answer {
      white-space: break-spaces;
    }

    .subHeader {
      font-size: 112.5%;
      font-weight: bold;
      margin: .5em auto;
      color: $fer-dark-blue;
    }

    .locationContainer {
      background-color: $fer-gray;

      .locationSubheader {
        font-size: 118.75%;
        opacity: .7;
      }

      .locationName {
        font-size: 162.5%;
        font-weight: bold;
        opacity: .7;
        color: $fer-black;
      }
    }

    .spacer {
      opacity: .5;
      border: 1px dashed $fer-black;
    }
  }
</style>
