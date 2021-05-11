<template>
  <v-navigation-drawer
    :class="{
      'd-none': !isMounted,
    }"
    :value="isOpen"
    app
    dark
    right
    temporary
    @input="setOpen"
  >
    <v-list :class="$style.listNav" flat nav>
      <v-subheader>
        <nuxt-link :class="$style.logoLink" :to="{ name: 'Index' }">
          <jobfair-meetup-logo />
        </nuxt-link>
      </v-subheader>

      <v-slide-y-transition
        :class="$style.linkContainer"
        group
        tag="v-list"
      >
        <v-list-item
          v-for="page in pages"
          :key="page.href || JSON.stringify(page.to)"

          :inactive="Boolean(page.href)"
          :ripple="!Boolean(page.href)"
          :to="page.to"
        >
          <v-list-item-content>
            <v-list-item-title>
              <v-btn
                v-if="page.href"
                :class="$style.navItemButton"
                :href="page.href"

                large
                nuxt
                outlined
                ripple
              >
                <translated-text :trans-key="page.name" />
              </v-btn>
              <translated-text
                v-else
                :class="$style.navItem"
                :trans-key="page.name"
              />
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item
          v-if="isLoggedIn"

          key="nav-user-module"
        >
          <v-list-item-content>
            <nav-user-module />
          </v-list-item-content>
        </v-list-item>

        <v-list-item
          v-else

          key="join-now-button"
          :to="joinNowRoute"
          ripple
        >
          <v-list-item-content>
            <v-list-item-title>
              <v-btn
                :class="$style.navItemButton"

                large
                nuxt
                outlined
                ripple
              >
                <translated-text trans-key="button.joinNow" />
              </v-btn>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-slide-y-transition>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
  import {
    mapGetters,
    mapMutations,
  } from "vuex";

  import JobfairMeetupLogo from "@/assets/images/logo/jobfair.svg";
  import NavUserModule from "~/components/NavUserModule";
  import TranslatedText from "~/components/TranslatedText";
  import {
    encodeRedirectParam,
  } from "~/helpers/url";

  export default {
    name: "AppNavDrawer",

    components: {
      TranslatedText,
      NavUserModule,
      JobfairMeetupLogo,
    },

    data: () => ({
      isMounted: false,
    }),

    computed: {
      ...mapGetters({
        pages: "pages/getPages",
        isOpen: "nav-drawer/isOpen",
        isLoggedIn: "user/isLoggedIn",
        getSetting: "settings/getSetting",
      }),

      joinNowRoute() {
        const name = this.getSetting("Join Now route", "PageLogin");

        return { name, query: { r: encodeRedirectParam(this.$route) } };
      },
    },

    mounted() {
      this.isMounted = true;
    },

    methods: {
      ...mapMutations({
        setOpen: "nav-drawer/SET_OPEN",
      }),
    },
  };
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  .listNav {
    padding-left: 1em;
  }

  .logoLink {
    display: flex;
  }

  .linkContainer {
    margin-top: 3em;

    .navItem {
      font-size: 137.5%;
      font-weight: 600;
      transition-timing-function: $transition-timing-function;
      transition-duration: 150ms;
      transition-property: color;
      color: $fer-white;

      &:hover {
        color: fer-hover($fer-yellow);
      }

      &:active {
        color: fer-active($fer-yellow);
      }
    }

    :global(.v-list-item--active) .navItem {
      color: $fer-yellow;

      &:hover {
        color: $fer-yellow;
      }

      &:active {
        color: $fer-yellow;
      }
    }
  }
</style>
