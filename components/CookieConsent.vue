<template>
  <div
    :class="{
      [$style.container]: true,
      'd-none': !showConsent
    }"
  >
    <div
      :class="$style.body"
    >
      <v-img
        :class="$style.image"
        :src="require('@/assets/images/icons/footer/icon-cookie.png')"
        aspect-ratio="1"
        contain
      />

      <div
        :class="$style.text"
      >
        <translated-text
          trans-key="cookieConsent.text"
        />
        <!--
        <a
          :class="$style.moreInfo"
          href="#"
          @click.stop="dialog = true"
        >
          <translated-text
            trans-key="cookieConsent.moreInfo.link"
          />
        </a>
        -->
      </div>

      <v-btn
        :class="$style.acceptButton"
        color="primary"
        depressed
        tile
        @click="acceptConsent"
      >
        <translated-text
          trans-key="button.accept"
        />
      </v-btn>

      <v-btn
        :class="$style.closeButton"
        color="secondary"
        icon
        @click="denyConsent"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>

    <v-dialog
      v-model="dialog"
      max-width="700"
    >
      <v-card>
        <v-card-title class="headline">
          <translated-text
            trans-key="cookieConsent.moreInfo.title"
          />
        </v-card-title>

        <v-card-text>
          <translated-text
            trans-key="cookieConsent.moreInfo.text"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            color="green darken-1"
            text
            @click="dialog = false"
          >
            <translated-text
              trans-key="actions.cancel"
            />
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import {
    mapActions,
    mapGetters,
  } from "vuex";
  import {
    onAnalyticsReady,
  } from "vue-analytics";
  import TranslatedText from "./TranslatedText";

  export default {
    name: "CookieConsent",

    components: {
      TranslatedText,
    },

    data: () => ({
      dialog: false,
    }),

    computed: {
      ...mapGetters("cookieConsent", [
        "showConsent",
        "hasConsent",
      ]),
    },

    mounted() {
      onAnalyticsReady().then(() => {
        this.$store.dispatch("cookieConsent/fetchConsent");
      });
    },

    methods: {
      ...mapActions("cookieConsent", [
        "acceptConsent",
        "denyConsent",
      ]),

      async consent(state) {
        switch (state) {
          case "accept":
            await this.acceptConsent();
            break;
          case "deny":
            await this.denyConsent();
            break;
        }
      },
    },
  };
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  $breakpoint: sm;

  .container {
    position: fixed;
    z-index: 99;
    right: 0;
    bottom: 1.5em;
    left: 0;
    max-width: $cookie-consent-max-width;
    margin: 0 auto;
    transition-timing-function: $transition-timing-function;
    transition-duration: .3s;
    transition-property: bottom, max-width;
    will-change: bottom, max-width;

    @include media($breakpoint) {
      bottom: 0;
      max-width: 100%;
    }

    .body {
      $gap: 14px;

      display: grid;
      align-items: center;
      justify-content: space-evenly;
      padding: $gap;
      background-color: transparentize($fer-white, .1);
      grid-template-columns: 40px auto auto auto;
      grid-template-rows: auto;
      grid-gap: $gap;
      grid-template-areas: "img text accept close";

      @include media($breakpoint) {
        grid-template-columns: auto;
        grid-template-areas:
          "text   close"
          "accept accept";
      }
    }

    .image {
      grid-area: img;

      @include media($breakpoint) {
        display: none !important;
      }
    }

    .text {
      font-size: 14px;
      display: inline-block;
      order: 1;
      color: $fer-black;
      grid-area: text;
    }

    .moreInfo {
      font-weight: 600;
      color: $fer-dark-blue;
    }

    .acceptButton {
      order: 2;
      color: $fer-black !important;
      grid-area: accept;

      @include media($breakpoint) {
        order: 4;
        width: 12em;
        margin-left: auto;
      }
    }

    .closeButton {
      display: block;
      order: 4;
      grid-area: close;

      @include media($breakpoint) {
        order: 2;
      }
    }
  }
</style>
