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
        >
          Back
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-btn
          :to="{ name: 'PageAdminPressReleaseList' }"
        >
          Press releases
        </v-btn>
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<script>
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";

  export default {
    name: "PageAdminPressIndex",

    components: {
      AppMaxWidthContainer,
    },
  };
</script>
