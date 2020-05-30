<template>
  <app-max-width-container>
    <v-row>
      <v-col>
        <h1>Admin panel</h1>
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<script>
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";

  export default {
    name: "PageAdminIndex",

    components: {
      AppMaxWidthContainer,
    },
  };
</script>
