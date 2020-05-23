<template>
  <v-navigation-drawer
    :value="isOpen"
    app
    right
    temporary
    dark
    @input="setOpen"
  >
    <v-list :class="$style.listNav" flat nav>
      <v-subheader>
        <nuxt-link :class="$style.logoLink" :to="{ name: 'Index' }">
          <jobfair-meetup-logo />
        </nuxt-link>
      </v-subheader>

      <v-list-item-group :class="$style.linkContainer">
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
                :href="page.href"
                :class="$style.navItemButton"

                large
                nuxt
                outlined
                ripple
              >
                {{ page.name }}
              </v-btn>
              <span
                v-else
                :class="$style.navItem"
              >
                {{ page.name }}
              </span>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-list-item-content>
            <nav-user-module />
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
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

  export default {
    name: "AppNavDrawer",

    components: {
      NavUserModule,
      JobfairMeetupLogo,
    },

    computed: {
      ...mapGetters({
        pages: "pages/getPages",
        isOpen: "nav-drawer/isOpen",
      }),
    },

    methods: {
      ...mapMutations({
        setOpen: "nav-drawer/SET_OPEN",
      }),
    },
  };
</script>

<style lang="scss" module>
  @import "../assets/styles/include/all";

  .listNav {
    padding-left: 1em;
  }

  .logoLink {
    display: flex;
  }

  .linkContainer {
    margin-top: 3em;

    .navItem {
      font-weight: 600;
      transition-timing-function: $transition-timing-function;
      transition-duration: 150ms;
      transition-property: color;
      color: $fer-white;
      font-size: 137.5%;

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
