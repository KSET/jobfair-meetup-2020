<template>
  <app-max-width-container :class="$style.container" class="mb-12">
    <v-row>
      <v-col cols="12">
        <h1 :class="$style.mainHeader">
          <translated-text trans-key="meetup.header" />
        </h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6" offset-md="3">
        <v-img
          :src="require('@/assets/images/meetup-illustration-1.svg?inline')"
          aspect-ratio="1"
          contain
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
      >
        <h2
          :class="$style.header"
        >
          <translated-text trans-key="meetup.about.header" />
        </h2>
        <p>
          <translated-text trans-key="meetup.about.text" />
        </p>
      </v-col>
    </v-row>

    <v-row
      :class="$style.locationContainer"
    >
      <v-col
        cols="12"
        md="10"
        offset-md="1"
      >
        <v-row>
          <v-col cols="12">
            <h2 :class="$style.header" class="text-center">
              <translated-text trans-key="meetup.location.header" />
            </h2>
            <h4 :class="$style.locationSubheader" class="text-center">
              <translated-text trans-key="meetup.location.text" />
            </h4>
          </v-col>
        </v-row>

        <v-row>
          <v-col
            cols="8"
            md="6"
            offset="2"
            offset-md="0"
          >
            <v-img
              :src="require('@/assets/images/meet-icon-1-kset.svg?inline')"
              aspect-ratio="1"
              class="mx-12"
              contain
            />
            <p :class="$style.locationName" class="mt-6 text-center">
              <translated-text trans-key="meetup.location.kset" />
            </p>
          </v-col>
          <v-col
            cols="8"
            md="6"
            offset="2"
            offset-md="0"
          >
            <v-img
              :src="require('@/assets/images/meet-icon-2-fer.svg?inline')"
              aspect-ratio="1"
              class="mx-12"
              contain
            />
            <p :class="$style.locationName" class="mt-6 text-center">
              <translated-text trans-key="meetup.location.fer" />
            </p>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
      >
        <h2
          :class="$style.header"
        >
          <translated-text trans-key="meetup.attractions.header" />
        </h2>
        <p
          class="mb-12"
        >
          <translated-text trans-key="meetup.attractions.text" />
        </p>
        <v-img
          :src="require('@/assets/images/meetup-illustration-2.svg?inline')"
          aspect-ratio="1.15"
          contain
        />
      </v-col>
    </v-row>

    <v-row
      class="mt-n4 mb-n8"
    >
      <v-col
        cols="12"
      >
        <v-divider
          :class="$style.spacer"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="10"
        offset-md="1"
      >
        <v-row>
          <v-col
            cols="12"
          >
            <v-img
              :src="require('@/assets/images/talks.svg?inline')"
              aspect-ratio="1"
              class="ml-md-n3 ml-md-0 ml-auto mb-n8 mb-md-0"
              contain
              width="100"
            />
            <h2
              :class="$style.header"
            >
              <translated-text trans-key="meetup.talks.header" />
            </h2>
            <p>
              <translated-text trans-key="meetup.talks.text" />
            </p>

            <h3
              :class="$style.subHeader"
              class="mt-11"
            >
              <translated-text trans-key="meetup.intoMyDay.header" />
            </h3>
            <p>
              <translated-text trans-key="meetup.intoMyDay.text" />
            </p>

            <h3
              :class="$style.subHeader"
              class="mt-8"
            >
              <translated-text trans-key="meetup.deepDive.header" />
            </h3>
            <p>
              <translated-text trans-key="meetup.deepDive.text" />
            </p>

            <h3
              :class="$style.subHeader"
              class="mt-8"
            >
              <translated-text trans-key="meetup.newTech.header" />
            </h3>
            <p>
              <translated-text trans-key="meetup.newTech.text" />
            </p>
          </v-col>
        </v-row>

        <v-row>
          <v-col
            cols="12"
          >
            <v-img
              :src="require('@/assets/images/workshops.svg?inline')"
              aspect-ratio="1"
              class="ml-md-n ml-md-0 ml-auto mb-n8 mb-md-0"
              contain
              width="100"
            />
            <h2
              :class="$style.header"
            >
              <translated-text trans-key="meetup.workshops.header" />
            </h2>
            <p>
              <translated-text trans-key="meetup.workshops.text" />
            </p>
          </v-col>
        </v-row>

        <v-row>
          <v-col
            cols="12"
          >
            <v-img
              :src="require('@/assets/images/panel.svg?inline')"
              aspect-ratio="1"
              class="ml-md-n ml-md-0 ml-auto mb-n8 mb-md-0"
              contain
              width="100"
            />
            <h2
              :class="$style.header"
            >
              <translated-text trans-key="meetup.panels.header" />
            </h2>
            <p>
              <translated-text trans-key="meetup.panels.text" />
            </p>
          </v-col>
        </v-row>

        <v-row>
          <v-col
            cols="12"
          >
            <v-img
              :src="require('@/assets/images/networking.svg?inline')"
              aspect-ratio="1"
              class="ml-md-n ml-md-0 ml-auto mb-n8 mb-md-0"
              contain
              width="100"
            />
            <h2
              :class="$style.header"
            >
              <translated-text trans-key="meetup.networking.header" />
            </h2>
            <p>
              <translated-text trans-key="meetup.networking.text" />
            </p>
          </v-col>
        </v-row>

        <v-row>
          <v-col
            cols="12"
          >
            <v-img
              :src="require('@/assets/images/party.svg?inline')"
              aspect-ratio="1"
              class="ml-md-n ml-md-0 ml-auto mb-n8 mb-md-0"
              contain
              width="100"
            />
            <h2
              :class="$style.header"
            >
              <translated-text trans-key="meetup.party.header" />
            </h2>
            <p>
              <translated-text trans-key="meetup.party.text" />
            </p>
          </v-col>
        </v-row>

        <v-row
          class="mb-n12"
        >
          <v-col
            cols="12"
            md="10"
            offset-md="1"
          >
            <v-img
              :src="require('@/assets/images/meet-illustration-3.svg?inline')"
              aspect-ratio="1"
              contain
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col
            cols="12"
          >
            <h2
              :class="$style.header"
            >
              <translated-text trans-key="meetup.howToParticipate.header" />
            </h2>

            <h3
              :class="$style.subHeader"
              class="mt-6"
            >
              <translated-text trans-key="meetup.cv.header" />
            </h3>
            <p>
              <translated-text trans-key="meetup.cv.text" />
            </p>

            <h3
              :class="$style.subHeader"
              class="mt-12"
            >
              <translated-text trans-key="meetup.qr.header" />
            </h3>
            <p>
              <translated-text trans-key="meetup.qr.text" />
            </p>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<script>
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";
  import TranslatedText from "~/components/TranslatedText";
  import {
    generateMetadata,
  } from "~/helpers/head";

  export default {
    name: "PageAbout",

    components: {
      TranslatedText,
      AppMaxWidthContainer,
    },

    head: () => ({
      title: "O Meetupu",
      meta: [
        ...generateMetadata({
          title: "O Meetupu",
        }),
      ],
    }),
  };
</script>

<style lang="scss" module>
  @import "../assets/styles/include/all";

  .container {
    $gap: 2.5em;

    max-width: 700px;
    margin: #{$gap} auto 0;

    * {
      text-align: justify;
    }

    :global(.row) + :global(.row) {
      margin-top: $gap;
    }

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
