<template>
  <v-app :class="$style.globalContainer">
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

      <div
        class="d-initial d-md-none"
        :class="$style.pageDisplay"
      >
        <nuxt-link
          v-for="page in pages"
          :key="JSON.stringify(page.to)"

          :active-class="$style.pageActive"
          tag="h2"

          :to="page.to"
          class="no-select"
          v-text="page.name"
        />
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
          <span :class="$style.navLinkText" v-text="page.name" />
        </nuxt-link>

        <nav-user-module class="ml-6" />
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
              v-text="page.name"
            />
          </v-list-item>

          <v-list-item>
            <v-list-item-icon>
              <v-icon>mdi-account</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <nav-user-module no-padding />
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
  import {
    mapGetters,
  } from "vuex";
  import NavUserModule from "~/components/NavUserModule";
  import {
    generateMetadata,
  } from "~/helpers/head";
  import MenuIcon from "~/assets/images/icons/menu.svg";

  export default {
    name: "LayoutAdmin",
    components: {
      NavUserModule,
      MenuIcon,
    },

    data: () => ({
      isOpen: false,
    }),

    computed: {
      ...mapGetters({
        pages: "adminPages/getPages",
      }),
    },

    methods: {
      setOpen(state) {
        this.isOpen = state;
      },
    },

    head() {
      return {
        title: "Admin panel",
        meta: [
          ...generateMetadata({
            title: "Admin panel",
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
      max-width: $content-max-width;
      margin: 0 auto;
      padding-top: 0;
      padding-bottom: 0;
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
