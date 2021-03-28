<template>
  <app-max-width-container>
    <v-row>
      <v-col>
        <h1>Press</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-btn
          :to="{ name: 'PageAdminIndex' }"
          exact
        >
          <v-icon left>
            mdi-arrow-left
          </v-icon>
          Back
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-btn
          v-for="page in pages"
          :key="page.to.name"
          :to="page.to"
          :class="$style.link"
        >
          <v-icon left v-text="page.icon" />
          {{ page.name }}
        </v-btn>
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<router>
name: PageAdminPressIndex
</router>

<script>
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";

  export default {
    name: "PageAdminPressIndex",

    components: {
      AppMaxWidthContainer,
    },

    computed: {
      pages() {
        return [
          {
            name: "News",
            to: { name: "PageAdminNewsList" },
            icon: "mdi-newspaper",
          },
          {
            name: "Press releases",
            to: { name: "PageAdminPressReleaseList" },
            icon: "mdi-file-document-multiple",
          },
          {
            name: "Press gallery",
            to: { name: "PageAdminPressGalleryList" },
            icon: "mdi-folder-multiple-image",
          },
          {
            name: "Press kit",
            to: { name: "PageAdminPressKitList" },
            icon: "mdi-briefcase-download",
          },
          {
            name: "Medijski pokrovitelji",
            to: { name: "PageAdminMediaPartnersList" },
            icon: "mdi-handshake",
          },
          {
            name: "Prijatelji Meetupa",
            to: { name: "PageAdminProjectFriendsList" },
            icon: "mdi-hand-heart",
          },
          {
            name: "Q'n'A",
            to: { name: "PageAdminQnAIndex" },
            icon: "mdi-frequently-asked-questions",
          },
        ];
      },
    },
  };
</script>

<style lang="scss" module>
    .link + .link {
      margin-left: 12px;
    }
</style>
