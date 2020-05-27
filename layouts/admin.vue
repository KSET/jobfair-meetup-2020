<template>
  <v-app>
    <v-app-bar app dark elevate-on-scroll>
      <v-toolbar-title>
        <v-btn
          v-ripple
          :class="$style.logoLink"
          :to="{ name: 'Index' }"
          class="black--text"
          color="primary"
          light
        >
          &larr; Back to site
        </v-btn>
      </v-toolbar-title>

      <v-spacer />

      <div :class="$style.navLinkContainer">
        <nuxt-link
          v-for="page in pages"
          :key="JSON.stringify(page.to)"

          v-ripple
          :active-class="page.exact ? '' : undefined"
          :class="$style.navLink"
          :to="page.to"
        >
          <span :class="$style.navLinkText" v-text="page.name" />
        </nuxt-link>

        <nav-user-module />
      </div>
    </v-app-bar>

    <v-content :class="$style.contentContainer">
      <v-container :class="$style.container" fluid>
        <nuxt :class="$style.pageContainer" />
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
  import NavUserModule from "~/components/NavUserModule";
  import {
    hid,
  } from "~/helpers/head";

  export default {
    name: "LayoutAdmin",
    components: { NavUserModule },
    data: () => ({
      pages: [
        {
          name: "Home",
          to: { name: "PageAdminIndex" },
          exact: true,
        },
        {
          name: "Press releases",
          to: { name: "PageAdminPressReleaseList" },
        },
        {
          name: "News",
          to: { name: "PageAdminNewsList" },
        },
        {
          name: "Translations",
          to: { name: "PageAdminTranslationsList" },
        },
        {
          name: "Settings",
          to: { name: "PageAdminSettingsList" },
        },
      ],
    }),

    head() {
      return {
        title: "Admin panel",
        meta: [
          hid({ name: "og:locale", content: "hr_HR" }),
        ],
      };
    },
  };
</script>

<style lang="scss" module>
  @import "../assets/styles/include/all";

  :global(.v-toolbar__content) {
    max-width: $content-max-width;
    margin: 0 auto;
    padding-top: 0;
    padding-bottom: 0;
  }

  .contentContainer {

    > :global(.v-content__wrap) {
      display: flex;
    }
  }

  .container {
    display: flex;
    padding: 0;
  }

  .pageContainer {
    width: 100%;
  }

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
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      will-change: color, border-bottom-color;

      &:active {
        border-bottom-color: transparentize($fer-yellow, .75);
      }

      &:global(.nuxt-link-active) {
        color: fer-hover($fer-yellow);
        border-bottom-color: fer-hover($fer-yellow);
      }

      &:global(.nuxt-link-exact-active) {
        cursor: default;
        color: fer-hover($fer-yellow);
        border-bottom-color: fer-hover($fer-yellow);
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
</style>
