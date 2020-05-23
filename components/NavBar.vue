<template>
  <v-app-bar app dark elevate-on-scroll>
    <v-toolbar-title>
      <nuxt-link v-ripple :class="$style.logoLink" :to="{ name: 'Index' }">
        <jobfair-meetup-logo />
      </nuxt-link>
    </v-toolbar-title>

    <v-spacer />

    <div :class="$style.navLinkContainer">
      <nuxt-link
        :is="page.href ? 'v-btn' : 'nuxt-link'"

        v-for="page in pages"
        :key="page.href || JSON.stringify(page.to)"

        v-ripple

        :class="[page.variant || $style.navLink]"

        :href="page.href"
        :rel="page.href ? 'noopener noreferrer' : ''"
        :target="page.href ? '_blank' : ''"
        :to="page.to"

        large
        nuxt
        outlined
      >
        <translated-text :trans-key="page.name" :class="$style.navLinkText" />
      </nuxt-link>

      <nav-user-module />
    </div>

    <v-btn :class="$style.navBurgerButton" icon @click.stop="toggleOpen">
      <menu-icon />
    </v-btn>
  </v-app-bar>
</template>

<script>
  import {
    mapGetters,
    mapMutations,
  } from "vuex";
  import MenuIcon from "~/assets/images/icons/menu.svg";
  import JobfairMeetupLogo from "~/assets/images/logo/jobfair.svg";
  import NavUserModule from "~/components/NavUserModule";
  import TranslatedText from "~/components/TranslatedText";

  export default {
    name: "AppNavBar",

    components: {
      NavUserModule,
      TranslatedText,
      MenuIcon,
      JobfairMeetupLogo,
    },

    computed: {
      ...mapGetters({
        rawPages: "pages/getPages",
      }),

      HeaderLinkVariants() {
        return {
          DEFAULT: "",
          BUTTON: this.$style.navLinkButton,
        };
      },

      pages() {
        return (
          this
            .rawPages
            .map((page) => {
              if (!page.href) {
                return page;
              }

              return {
                ...page,
                variant: this.HeaderLinkVariants.BUTTON,
              };
            })
        );
      },
    },

    methods: {
      ...mapMutations({
        toggleOpen: "nav-drawer/TOGGLE_OPEN",
      }),
    },
  };
</script>

<style lang="scss" module>
  @import "../assets/styles/include/all";

  $nav-height: 64px;

  .logoLink {
    display: flex;
    padding: .3em;
    border-radius: 4px;
  }

  .navBurgerButton {
    display: none;

    @include media(sm) {
      display: initial;
    }
  }

  .navLinkContainer {
    display: flex;
    align-self: stretch;

    @include media(sm) {
      display: none;
    }

    .navLink {
      @extend %nav-link;

      .navLinkText {
        align-self: center;
      }
    }

    .navLinkButton {
      align-self: center;
      margin: 0 1.2em;
    }
  }

  :global(.v-toolbar__content) {
    max-width: $content-max-width;
    margin: 0 auto;
    padding-top: 0;
    padding-bottom: 0;
  }
</style>
