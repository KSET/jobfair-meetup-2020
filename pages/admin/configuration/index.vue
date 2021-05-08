<template>
  <app-max-width-container>
    <v-row>
      <v-col>
        <h1>Site configuration</h1>
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
          :class="$style.link"
          :to="page.to"
        >
          <v-icon left v-text="page.icon" />
          {{ page.name }}
        </v-btn>
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<router>
name: PageAdminConfigurationIndex
</router>

<script>
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";
  import {
    RoleNames,
  } from "~/api/helpers/permissions";

  export default {
    name: "PageAdminConfigurationIndex",

    middleware: "is-admin",

    components: {
      AppMaxWidthContainer,
    },

    data: () => ({
      pages: [
        {
          name: "Translations",
          to: { name: "PageAdminTranslationsList" },
          requiredRole: RoleNames.ADMIN,
          icon: "mdi-transcribe",
        },
        {
          name: "Settings",
          to: { name: "PageAdminSettingsList" },
          requiredRole: RoleNames.ADMIN,
          icon: "mdi-cog",
        },
        {
          name: "Cache",
          to: { name: "PageAdminCacheManage" },
          requiredRole: RoleNames.ADMIN,
          icon: "mdi-cached",
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
