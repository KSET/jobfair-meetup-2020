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
          class="ml-3"
        >
          {{ page.name }}
        </v-btn>
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

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
        pages: "adminPages/getPages",
      }),
    },
  };
</script>
