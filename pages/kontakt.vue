<template>
  <app-max-width-container :class="$style.container" class="mb-12">
    <v-row>
      <v-col
        cols="12"
      >
        <h1
          :class="$style.header"
          class="text-center my-12"
        >
          <translated-text trans-key="contact.header" />
        </h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col class="mb-12" cols="12" md="5" offset-md="1">
        <v-img
          :src="require('@/assets/images/contact-illustration.svg?inline')"
          aspect-ratio="0.95"
          contain
        />
      </v-col>
      <v-col class="d-flex" cols="10" md="5" offset="1" offset-md="1">
        <div class="align-self-center">
          <h2
            :class="$style.subHeader"
          >
            <translated-text trans-key="contact.jobFair" />
          </h2>
          <div>
            <div :class="$style.linkContainer">
              <v-img
                :class="$style.icon"
                :src="require('@/assets/images/icons/contact-icon-mail.svg?inline')"
                aspect-ratio="1"
                contain
              />
              <a
                :class="$style.link"
                :href="`mailto:${trans.email}`"
              >
                <translated-text v-model="trans.email" trans-key="contact.jobFair.email" />
              </a>
            </div>

            <div :class="$style.linkContainer">
              <v-img
                :class="$style.icon"
                :src="require('@/assets/images/icons/contact-icon-location.svg?inline')"
                aspect-ratio="1"
                contain
              />
              <a
                :class="$style.link"
                :href="`https://www.google.com/maps/place/${encodeURIComponent(trans.address)}`"
                rel="noopener noreferrer"
                target="_blank"
              >
                <translated-text v-model="trans.address" trans-key="contact.location.address" />
              </a>
            </div>
          </div>

          <h2
            :class="$style.subHeader"
            class="mt-12"
          >
            <translated-text trans-key="contact.social.headers" />
          </h2>
          <div>
            <div :class="$style.linkContainer">
              <v-img
                :class="$style.icon"
                :src="require('@/assets/images/icons/contact-icon-insta.svg?inline')"
                aspect-ratio="1"
                contain
              />
              <a
                :class="$style.link"
                href="#"
                rel="noopener noreferrer"
                target="_blank"
              >
                <translated-text trans-key="contact.social.instagram" />
              </a>
            </div>

            <div :class="$style.linkContainer">
              <v-img
                :class="$style.icon"
                :src="require('@/assets/images/icons/contact-icon-fb.svg?inline')"
                aspect-ratio="1"
                contain
              />
              <a
                :class="$style.link"
                href="#"
                rel="noopener noreferrer"
                target="_blank"
              >
                <translated-text trans-key="contact.social.facebook" />
              </a>
            </div>

            <div :class="$style.linkContainer">
              <v-img
                :class="$style.icon"
                :src="require('@/assets/images/icons/contact-icon-yt.svg?inline')"
                aspect-ratio="1"
                contain
              />
              <a
                :class="$style.link"
                href="#"
                rel="noopener noreferrer"
                target="_blank"
              >
                <translated-text trans-key="contact.social.youtube" />
              </a>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<script>
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";
  import TranslatedText from "~/components/TranslatedText";

  export default {
    name: "PageKontakt",

    components: {
      TranslatedText,
      AppMaxWidthContainer,
    },

    data: () => ({
      trans: {
        email: "",
        address: "",
      },
    }),
  };
</script>

<style lang="scss" module>
  @import "../assets/styles/include/all";

  .container {

    .header {
      font-size: 250%;
      color: $fer-dark-blue;
    }

    .subHeader {
      font-size: 162.5%;
      margin-bottom: .8em;
      color: $fer-dark-blue;
    }

    .linkContainer {
      font-size: 125%;

      & + .linkContainer {
        margin-top: .69em;
      }

      .icon {
        position: relative;
        top: .2em;
        display: inline-block;
        width: 1em;
        height: 1em;
        margin-right: .69em;
      }

      .link {
        font-size: 100%;
        text-decoration: none;
        color: $fer-black;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
</style>
