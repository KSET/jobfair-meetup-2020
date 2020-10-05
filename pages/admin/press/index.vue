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
          :to="{ name: 'PageAdminPressReleaseList' }"
        >
          Press releases
        </v-btn>
        <v-btn
          :to="{ name: 'PageAdminPressGalleryList' }"
          class="ml-3"
        >
          Press gallery
        </v-btn>
        <v-btn
          :to="{ name: 'PageAdminPressKitList' }"
          class="ml-3"
        >
          Press kit
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
  };
</script>
