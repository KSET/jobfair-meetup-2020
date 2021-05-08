<template>
  <app-max-width-container>
    <v-row>
      <v-col cols="12">
        <h1>Cache</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-btn
          :to="{ name: 'PageAdminConfigurationIndex' }"
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
      <v-col cols="12">
        <div class="d-flex">
          <v-spacer />

          <v-btn
            :loading="refreshLoading"
            color="warning"
            @click="doRefreshCache"
          >
            <v-icon>mdi-cached</v-icon>
            &nbsp;
            Refresh all
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="(data, key) in allEntries"
        :key="key"
        cols="12"
        lg="4"
        sm="6"
      >
        <v-card
          :loading="itemLoading[key] || data.fetching"
        >
          <v-card-title
            v-text="key.replace(/:default$/i, '').replace(/^cache:/i, '').split(':').join(' > ')"
          />

          <v-card-text>
            <v-simple-table dense>
              <template v-slot:default>
                <tbody>
                  <tr
                    v-for="(value, key) in data"
                    :key="key"

                    :title="`${key}: ${value}`"
                  >
                    <td v-text="formatKey(key)" />

                    <td
                      v-if="typeof value === 'number'"
                      class="text-right"
                      v-text="prettyMs(value, false)"
                    />
                    <td
                      v-else-if="typeof value === 'boolean'"
                      class="text-right"
                      v-text="value ? '✅' : '❌'"
                    />
                    <td
                      v-else
                      class="text-right"
                      v-text="value"
                    />
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-card-text>

          <v-card-actions>
            <v-btn
              :href="`/api/meta/cache/info/for/${key}/with-data`"
              color="warning"
              icon
              target="_blank"
            >
              <v-icon>mdi-information</v-icon>
            </v-btn>

            <v-spacer />

            <v-btn
              :loading="itemLoading[key] || data.fetching"
              icon
              @click.prevent="refreshCacheItem(key)"
            >
              <v-icon>mdi-cached</v-icon>
            </v-btn>

            <v-spacer />

            <v-btn
              :loading="itemLoading[key]"
              color="red"
              icon
              @click.prevent="deleteCacheItem(key)"
            >
              <v-icon>mdi-trash-can</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<router>
name: PageAdminCacheManage
</router>

<script>
  import {
    flow,
    kebabCase,
    replace,
    capitalize,
  } from "lodash/fp";
  import {
    mapActions,
    mapGetters,
  } from "vuex";
  import prettyMs from "pretty-ms";
  import AppMaxWidthContainer from "../../../../components/AppMaxWidthContainer";

  const formatKey =
    flow(
      kebabCase,
      replace(/-/gi, " "),
      capitalize,
    )
  ;

  export default {
    components: {
      AppMaxWidthContainer,
    },

    async asyncData({ store }) {
      const entries = await store.dispatch("meta/cache/fetchEntries");

      return {
        fetchInterval: null,

        itemLoading: Object.fromEntries(Object.keys(entries).map((k) => [ k, false ])),
        refreshLoading: false,
      };
    },

    computed: {
      ...mapGetters("meta/cache", [
        "allEntries",
      ]),
    },

    watch: {
      allEntries(entries) {
        for (const key of Object.keys(entries)) {
          if (key in this.itemLoading) {
            continue;
          }

          this.$set(this.itemLoading, key, false);
        }
      },
    },

    mounted() {
      this.fetchInterval = setInterval(this.fetchEntries, 1000 + 1000 * Math.random());
    },

    beforeDestroy() {
      clearInterval(this.fetchInterval);
    },

    methods: {
      ...mapActions("meta/cache", [
        "fetchEntries",
        "deleteEntry",
        "refreshCache",
        "refreshCacheFor",
      ]),

      prettyMs(ms, rounded = true) {
        if (rounded) {
          return prettyMs(Math.round(ms / 1000) * 1000);
        }

        return prettyMs(ms);
      },

      async deleteCacheItem(key) {
        this.$set(this.itemLoading, key, true);
        await this.deleteEntry(key);
        await this.fetchEntries();
        this.$set(this.itemLoading, key, false);
      },

      async refreshCacheItem(key) {
        this.$set(this.itemLoading, key, true);
        await this.refreshCacheFor(key);
        await this.fetchEntries();
        this.$set(this.itemLoading, key, false);
      },

      formatKey(key) {
        return formatKey(key);
      },

      async doRefreshCache() {
        this.refreshLoading = true;
        await this.refreshCache();
        this.refreshLoading = false;
      },
    },
  };
</script>
