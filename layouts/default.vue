<template>
  <v-app>
    <app-nav-bar />

    <app-nav-drawer class="d-md-none" />

    <v-main :class="$style.contentContainer">
      <v-container :class="$style.container" fluid>
        <nuxt :class="$style.pageContainer" />
      </v-container>
    </v-main>

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
      const title = "Dobrodošli";

      return {
        title,
        meta: [
          ...generateMetadata({
            title,
            locale: "hr",
            image: require("@/assets/images/facebook-share.png"),
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
    min-height: 100%;
    padding: 0;
  }

  .pageContainer {
    width: 100%;
  }
</style>
