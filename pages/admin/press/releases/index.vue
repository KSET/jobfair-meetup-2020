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
          :to="{ name: 'PageAdminPressIndex' }"
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
          :items="releases"
          hide-default-footer
        >
          <template v-slot:default="props">
            <v-row>
              <transition-group name="list" style="display: contents;">
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

                    <v-divider />

                    <v-list dense>
                      <v-list-item>{{ item.date }}</v-list-item>
                      <v-list-item><a :href="item.url" target="_blank">{{ item.name }}</a></v-list-item>
                    </v-list>

                    <v-card-actions>
                      <v-btn
                        :loading="item.loading"
                        color="error"
                        @click.prevent="deletePressRelease(item.id)"
                      >
                        Delete
                      </v-btn>

                      <v-spacer />

                      <v-btn
                        :loading="item.loading"
                        :to="{ name: 'PageAdminPressReleaseEdit', params: { id: item.id } }"
                        color="warning"
                      >
                        Edit
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </transition-group>
            </v-row>
          </template>
        </v-data-iterator>
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<router>
name: PageAdminPressReleaseList
</router>

<script>
  import {
    mapActions,
  } from "vuex";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";

  export default {
    name: "PageAdminPressReleaseList",

    components: {
      AppMaxWidthContainer,
    },

    async asyncData({ store }) {
      const addProperty =
        (property, value = null) =>
          (list) =>
            list.map(
              (entry) => ({
                ...entry,
                [property]: value,
              }),
            )
      ;

      return {
        releases: await store.dispatch("pressRelease/fetchAllPressReleases").then(addProperty("loading", false)),
      };
    },

    methods: {
      ...mapActions({
        doDeletePressRelease: "pressRelease/deletePressRelease",
      }),

      async deletePressRelease(id) {
        if (!window.confirm("Are you sure you want to delete that?")) {
          return false;
        }

        const release = this.releases.find(({ id: i }) => i === id);

        release.loading = true;

        const { error, errorData } = await this.doDeletePressRelease({ id });

        release.loading = false;

        if (error) {
          const err =
            errorData
              ? errorData.join("\n")
              : "Something went wrong"
          ;

          return alert(err);
        }

        this.$set(this, "releases", this.releases.filter(({ id: i }) => i !== id));
      },
    },
  };
</script>

<style lang="scss" scoped>
  .list-item {
    display: inline-block;
    margin-right: 10px;
  }

  .list-enter-active,
  .list-leave-active {
    transition: all .5s;
  }

  .list-enter,
  .list-leave-to {
    transform: translateY(30px);
    opacity: 0;
  }
</style>
