<template>
  <app-max-width-container>
    <v-row>
      <v-col cols="12">
        <h1>Press releases</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-btn
          :to="{ name: 'PageAdminIndex' }"
        >
          Back
        </v-btn>
        <v-btn
          :to="{ name: 'PageAdminPressReleaseCreate' }"
          color="success"
        >
          Create
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-data-iterator
          hide-default-footer
          :items="releases"
        >
          <template v-slot:default="props">
            <v-row>
              <v-col
                v-for="item in props.items"
                :key="item.id"
                cols="12"
                lg="3"
                md="4"
                sm="6"
              >
                <v-card>
                  <v-card-title class="subheading font-weight-bold">
                    {{ item.title }}
                  </v-card-title>
                  <v-card-actions>
                    <v-btn
                      :to="{ name: 'PageAdminPressReleaseEdit', params: { id: item.id } }"
                    >
                      Edit
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </template>
        </v-data-iterator>
      </v-col>
    </v-row>
  </app-max-width-container>
</template>
<script>
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";

  export default {
    name: "PageAdminPressReleaseList",

    components: {
      AppMaxWidthContainer,
    },

    async asyncData({ store }) {
      return {
        releases: await store.dispatch("pressRelease/fetchAllPressReleases"),
      };
    },
  };
</script>
