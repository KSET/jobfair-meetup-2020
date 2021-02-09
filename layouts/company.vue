<template>
  <v-app :class="$style.globalContainer">
    <v-app-bar app dark elevate-on-scroll>
      <v-toolbar-title>
        <v-btn
          v-ripple
          :class="$style.backButton"
          :to="{ name: 'Index' }"
          outlined
          text
          x-large
        >
          <v-icon
            :class="$style.backButtonIcon"
            large
            left
            v-text="'mdi-chevron-left'"
          />
          <translated-text trans-key="company.layout.backToSite" />
        </v-btn>
      </v-toolbar-title>

      <v-spacer />

      <div
        :class="$style.pageDisplay"
        class="d-initial d-md-none"
      >
        <nuxt-link
          v-for="page in pages"
          :key="JSON.stringify(page.to)"

          :active-class="$style.pageActive"
          :to="page.to"

          class="no-select"
          tag="h2"
        >
          <translated-text :class="$style.navLinkText" :trans-key="page.name" />
        </nuxt-link>
      </div>

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
          <translated-text :class="$style.navLinkText" :trans-key="page.name" />
        </nuxt-link>

        <nav-user-module class="ml-6" label="email" />
      </div>

      <v-btn :class="$style.navBurgerButton" icon @click.stop="setOpen(true)">
        <menu-icon />
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer
      :value="isOpen"
      app
      dark
      right
      temporary
      @input="setOpen"
    >
      <v-list flat nav>
        <v-subheader class="no-select">
          <h1>Admin panel</h1>
        </v-subheader>

        <v-list-item-group>
          <v-list-item
            v-for="page in pages"
            :key="JSON.stringify(page.to)"
            :to="page.to"
          >
            <v-list-item-icon
              v-if="page.icon"
            >
              <v-icon
                v-text="page.icon"
              />
            </v-list-item-icon>
            <v-list-item-title
              class="font-weight-bold"
            >
              <translated-text :trans-key="page.name" />
            </v-list-item-title>
          </v-list-item>

          <v-list-item>
            <v-list-item-icon>
              <v-icon>mdi-account</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <nav-user-module label="email" no-padding />
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-main :class="$style.contentContainer">
      <v-container :class="$style.container" fluid>
        <nuxt :class="$style.pageContainer" />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
  import NavUserModule from "~/components/NavUserModule";
  import TranslatedText from "~/components/TranslatedText";
  import {
    generateMetadata,
  } from "~/helpers/head";
  import MenuIcon from "~/assets/images/icons/menu.svg";

  export default {
    name: "LayoutCompany",

    components: {
      TranslatedText,
      NavUserModule,
      MenuIcon,
    },

    data() {
      return {
        isOpen: false,
        pages: [
          {
            to: {
              name: "PageCompanyResumes",
            },
            name: "page.company.adminPanel.resumes",
          },
          {
            to: {
              name: "PageCompanyViewInfo",
            },
            name: "page.company.adminPanel.info",
          },
        ],
      };
    },

    methods: {
      setOpen(state) {
        this.isOpen = state;
      },
    },

    head() {
      return {
        title: "Company panel",
        meta: [
          ...generateMetadata({
            title: "Company panel",
            locale: "hr",
          }),
        ],
      };
    },
  };
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  .globalContainer {

    :global(.v-toolbar__content) {
      max-width: $company-max-width;
      margin: 0 auto;
      padding-top: 0;
      padding-bottom: 0;

      @include media(sm) {
        max-width: $company-max-width-mobile;
      }
    }
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

  .backButton {
    font-weight: 600;
    color: $fer-white !important;
    border: none !important;
    background: none !important;

    &::before {
      opacity: 0 !important;
    }

    .backButtonIcon {
      font-weight: 300;
      transition-timing-function: $transition-bounce-function;
      transition-duration: 350ms;
      transition-property: transform;
      transform: translateX(0);
      will-change: transform;
    }

    &:hover {

      .backButtonIcon {
        $offset: -6px;

        transform: translateX($offset);
      }
    }
  }

  .navBurgerButton {
    display: none;

    @include media(sm) {
      display: initial;
    }
  }

  .pageActive {
    display: initial;
  }

  .pageDisplay {

    > * {
      display: none;

      &.pageActive {
        display: initial;

        &:first-child {
          display: none;
        }
      }
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
