<template>
  <v-app>
    <app-nav-bar />

    <app-nav-drawer />

    <v-content>
      <v-container :class="$style.container" class="fill-height" fluid>
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

  export default {

    components: {
      AppNavBar,
      AppNavDrawer,
      AppFooter,
    },

    head() {
      const pageInfo = this.$route.meta.head || {};

      const metaMap = {
        title: [ "og:title", "apple-mobile-web-app-title" ],
        description: [ "og:description" ],
      };

      const getAliasedKeys = (key) => [ key, ...(metaMap[key] || []) ];

      const metaPageData =
        [
          ...Object.entries(pageInfo.page || {}),
          [ "title", pageInfo.title ? `${ pageInfo.title } - JobFair MeetUP` : "JobFair MeetUP" ],
        ]
          .flatMap(
            ([ key, content ]) =>
              getAliasedKeys(key)
                .map(
                  (name) => ({
                    hid: name,
                    name,
                    content,
                  }),
                )
            ,
          )
      ;

      return {
        title: "Welcome",
        ...pageInfo,
        meta: metaPageData,
      };
    },
  };
</script>

<style lang="scss" module>
  @import "../assets/styles/include/all";

  .container {
    padding: 0;
  }

  .pageContainer {
    width: 100%;
  }
</style>
