<template>
  <app-max-width-container>
    <v-row>
      <v-col>
        <h1>Event organisation</h1>
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
name: PageAdminEventIndex
</router>

<script>
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";
  import {
    RoleNames,
  } from "~/api/helpers/permissions";

  export default {
    name: "PageAdminEventIndex",

    components: {
      AppMaxWidthContainer,
    },

    data: () => ({
      pages: [
        {
          name: "Events",
          to: { name: "PageAdminEventsIndex" },
          icon: "mdi-clipboard-account",
        },
        {
          name: "Resumes",
          to: { name: "PageAdminResumes" },
          icon: "mdi-file-document",
        },
        {
          name: "Panel",
          to: { name: "PageAdminPanelsIndex" },
          requiredRole: RoleNames.ADMIN,
          icon: "mdi-human-queue",
        },
        {
          name: "Company Applications",
          to: { name: "PageAdminCompanyApplicationsList" },
          requiredRole: RoleNames.ADMIN,
          icon: "mdi-text-box-multiple-outline",
        },
      ],
    }),
  };
</script>

<style lang="scss" module>
  .link + .link {
    margin-left: 12px;
  }
</style>
