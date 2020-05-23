<template>
  <app-max-width-container>
    <h1>Admin panel</h1>
    <v-btn :to="{ name: 'PageAdminPressReleaseList' }">
      Press releases
    </v-btn>
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
