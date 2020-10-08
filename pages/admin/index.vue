<template>
  <app-max-width-container>
    <v-row>
      <v-col>
        <h1>Admin panel</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-btn
          v-for="page in pages"
          :key="JSON.stringify(page.to)"

          :to="page.to"
          class="ml-3 mb-3"
        >
          <v-icon left v-text="page.icon" />
          {{ page.name }}
        </v-btn>
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<router>
name: PageAdminIndex
</router>

<script>
  import {
    mapGetters,
  } from "vuex";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";

  export default {
    name: "PageAdminIndex",

    components: {
      AppMaxWidthContainer,
    },

    computed: {
      ...mapGetters({
        rawPages: "adminPages/getPages",
      }),

      pages() {
        return this.rawPages.filter(({ name }) => "Home" !== name);
      },
    },
  };
</script>
