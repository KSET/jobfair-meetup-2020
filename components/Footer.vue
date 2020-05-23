<template>
  <v-footer absolute app dark>
    <v-container :class="$style.container" fluid>
      <v-row :class="$style.hideOnSmall">
        <v-col>
          <h1 :class="$style.organizatori">
            <translated-text trans-key="footer.organisers" />
          </h1>
        </v-col>
      </v-row>
      <v-row :class="[ $style.logoRow, $style.hideOnSmall ]">
        <v-col
          v-for="logo in logos"
          :key="logo.src"

          :class="$style.logoCol"
          class="text-center"

          cols="6"
          md="3"
        >
          <img
            :alt="logo.name"
            :class="$style.logo"
            :src="logo.src"
            :style="{ 'height': logo.height }"
          >
        </v-col>
      </v-row>
      <v-row :class="$style.hideOnSmall">
        <v-divider :class="$style.spacer" />
      </v-row>
      <v-row :class="$style.bottomPart">
        <v-col
          cols="6"
          md="6"
          order="3"
          order-md="1"
        >
          <img
            :class="$style.jobfairLogo"
            :src="jobfairMonospaceLogo"
            alt="JobFair MeetUP"
          >
          <div :class="$style.afterJobfairText">
            <translated-text trans-key="footer.legal.kset" /> &copy; {{ (new Date).getFullYear() }}
          </div>
          <div :class="$style.afterJobfairText">
            <translated-text trans-key="footer.legal.allRightsReserved" />
          </div>
        </v-col>
        <v-col
          cols="6"
          md="2"
          order="1"
          order-md="2"
        >
          <div>
            <strong>
              <translated-text trans-key="footer.apps.header" />
            </strong>
          </div>
          <div>
            <a href="https://kutt.it/xT6JNg" rel="noopener noreferrer" target="_blank">
              <translated-text trans-key="footer.apps.android" />
            </a>
          </div>
          <div>
            <a href="https://kutt.it/rQAtiS" rel="noopener noreferrer" target="_blank">
              <translated-text trans-key="footer.apps.iphone" />
            </a>
          </div>
        </v-col>
        <v-col
          cols="6"
          md="2"
          order="2"
          order-md="3"
        >
          <div>
            <strong>
              <translated-text trans-key="footer.contact.header" />
            </strong>
          </div>
          <div>
            <translated-text trans-key="footer.contact.jobfair.text" />
          </div>
          <div>
            <translated-text trans-key="footer.contact.jobfair.email" />
          </div>
          <div>
            <translated-text trans-key="footer.contact.jobfair.location" />
          </div>
        </v-col>
        <v-col
          cols="6"
          md="2"
          order="4"
          order-md="4"
        >
          <div>
            <strong>
              <translated-text trans-key="footer.followUs" />
            </strong>
          </div>
          <div>
            <v-btn
              v-for="icon in socialIcons"
              :key="icon.src"

              :class="$style.socialIcon"
              :href="icon.href"
              icon
              rel="noopener noreferrer"
              small
              target="_blank"
            >
              <img
                :alt="icon.name"
                :src="icon.src"
              >
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script>
  import TranslatedText from "~/components/TranslatedText";

  export default {
    name: "AppFooter",
    components: { TranslatedText },
    computed: {

      logos() {
        return [
          {
            name: "FER",
            src: require("@/assets/images/logo/fer.svg?inline"),
          },
          {
            name: "Centar Karijera",
            src: require("@/assets/images/logo/ck.svg?inline"),
          },
          {
            name: "KSET",
            src: require("@/assets/images/logo/kset.svg?inline"),
          },
          {
            name: "SSFER",
            src: require("@/assets/images/logo/ssfer.svg?inline"),
            height: "9em",
          },
        ];
      },

      jobfairMonospaceLogo() {
        return require("@/assets/images/logo/jobfair-mono.svg?inline");
      },

      socialIcons() {
        return [
          {
            name: "Instagram",
            href: "#",
            src: require("@/assets/images/icons/instagram.svg?inline"),
          },
          {
            name: "Facebook",
            href: "#",
            src: require("@/assets/images/icons/facebook.svg?inline"),
          },
          {
            name: "Youtube",
            href: "#",
            src: require("@/assets/images/icons/youtube.svg?inline"),
          },
        ];
      },

    },

  };
</script>

<style lang="scss" module>
  @import "../assets/styles/include/all";

  .container {
    width: 95%;
    max-width: $content-max-width;

    @include media(sm) {
      max-width: 100%;
    }

    a {
      text-decoration: none;
      color: $fer-white;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .organizatori {
    font-size: 2.5em;
    margin-bottom: 1em;
    text-align: center;
    color: $fer-yellow;

    @include media(sm) {
      font-size: 2em;
    }
  }

  .logoRow {
    width: 60%;
    margin: 0 auto;

    @include media(sm) {
      width: 100%;
    }

    .logoCol {
      align-self: center;

      .logo {
        height: 3em;
      }
    }
  }

  .spacer {
    border-color: rgba(255, 255, 255, .42) !important;
  }

  .bottomPart {
    font-size: 87.5%;
    margin-top: 1.5em;

    strong {
      display: block;
      margin-bottom: .3em;
    }
  }

  .jobfairLogo {
    $height: 3em;
    $aspect-ratio: 110 / 40;

    width: $height * $aspect-ratio;
    height: $height;
    margin-bottom: 1em;
  }

  .afterJobfairText {
    font-size: 90%;
    opacity: .7;
  }

  .socialIcon {
    margin-right: 1.5em;

    &:last-child {
      margin-right: initial;
    }
  }

  @include media(md) {

    .hideOnSmall {
      display: none;
    }

  }
</style>
