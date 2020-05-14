<template>
  <v-app-bar app dark elevate-on-scroll>
    <v-toolbar-title>
      <nuxt-link :class="$style.logoLink" :to="{ name: 'Index' }">
        <jobfair-meetup-logo />
      </nuxt-link>
    </v-toolbar-title>

    <v-spacer />

    <div :class="$style.navLinkContainer">
      <nuxt-link
        :is="page.href ? 'v-btn' : 'nuxt-link'"

        v-for="page in pages"
        :key="page.href || JSON.stringify(page.to)"

        :class="[page.variant || $style.navLink]"

        :href="page.href"
        :rel="page.href ? 'noopener noreferrer' : ''"
        :target="page.href ? '_blank' : ''"
        :to="page.to"

        :v-ripple="Boolean(page.href)"

        large
        nuxt
        outlined
      >
        <span :class="$style.navLinkText">{{ page.name }}</span>
      </nuxt-link>
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

  export default {
    name: "AppNavBar",

    components: {
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
      $border-size: 4px;

      font-weight: 600;
      display: flex;
      box-sizing: border-box;
      margin: 0 1.2em;
      padding: 0 .4em;
      transition-timing-function: $transition-timing-function;
      transition-duration: 150ms;
      transition-property: color, border-bottom-color;
      text-decoration: none;
      color: $fer-white;
      border-top: #{$border-size} solid transparent;
      border-bottom: #{$border-size} solid transparent;
      will-change: color, border-bottom-color;

      &:global(.nuxt-link-active) {
        color: fer-hover($fer-yellow);
        border-bottom-color: fer-hover($fer-yellow);
      }

      &:global(.nuxt-link-exact-active) {
        cursor: default;
      }

      &:hover {
        color: fer-hover($fer-yellow);
      }

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
