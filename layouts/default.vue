<template>
  <v-app>
    <app-nav-bar />

    <app-nav-drawer />

    <v-content :class="$style.contentContainer">
      <v-container :class="$style.container" fluid>
        <nuxt :class="$style.pageContainer" />
      </v-container>
    </v-content>

    <app-footer />
  </v-app>
</template>

<script>
  import AppNavBar from "@/components/NavBar";
  import AppNavDrawer from "@/components/NavDrawer";
  import AppFooter from "@/components/Footer";
  import {
    generateMetadata,
  } from "~/helpers/head";

  export default {
    name: "LayoutDefault",

    components: {
      AppNavBar,
      AppNavDrawer,
      AppFooter,
    },

    watch: {
      "$route.path": {
        handler() {
          setTimeout(
            () => {
              this.$store.dispatch("translations/syncNewTranslations");
            },
            500,
          );
        },
        immediate: true,
      },
    },

    head() {
      return {
        meta: [
          ...generateMetadata({
            title: "Welcome",
            locale: "hr",
            image: require("@/assets/images/facebook-share.jpg"),
          }),
        ],
      };
    },
  };
</script>

<style lang="scss" module>
  @import "../assets/styles/include/all";

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
</style>
