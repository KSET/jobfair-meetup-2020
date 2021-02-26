<template>
  <app-max-width-container class="mb-6">
    <v-row>
      <v-col cols="12">
        <h1>Translations</h1>
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

    <v-data-iterator
      :items="translations"
      :items-per-page="itemsPerPage"
      :search.sync="search"
      :page.sync="page"
      :custom-filter="customFilter"
      hide-default-footer
    >
      <template v-slot:header>
        <v-toolbar
          class="mb-1"
          color="primary"
          dark
        >
          <v-text-field
            v-model="search"
            clearable
            flat
            hide-details
            label="Search"
            prepend-inner-icon="mdi-magnify"
            solo-inverted
          />
        </v-toolbar>
      </template>

      <template v-slot:default="props">
        <v-row>
          <v-col
            v-for="key in props.items"
            :key="key"
            cols="12"
            lg="3"
            md="4"
            sm="6"
          >
            <v-card>
              <v-card-title class="subtitle-1 font-weight-bold">
                {{ key }}
              </v-card-title>

              <v-divider />

              <v-list dense>
                <v-list-item>
                  <v-list-item-content>
                    <v-textarea
                      v-model="translationData[key].value"
                      :loading="translationData[key].loading"
                      :readonly="translationData[key].loading"
                      auto-grow
                      label="Value"
                      rows="1"
                    />
                    <v-expand-transition>
                      <v-sheet
                        v-if="translationData[key].error.length > 0"
                        class="caption error white--text pa-2 py-1"
                        v-text="translationData[key].error"
                      />
                    </v-expand-transition>
                  </v-list-item-content>

                  <v-list-item-action>
                    <v-list-item-action-text>
                      <v-btn
                        :loading="translationData[key].loading"
                        color="success"
                        small
                        @click="saveTranslation(key)"
                      >
                        Save
                      </v-btn>
                    </v-list-item-action-text>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </template>

      <template v-slot:footer>
        <v-row align="center" class="mt-2" justify="center">
          <span class="grey--text">Items per page</span>
          <v-menu offset-y>
            <template v-slot:activator="{ on }">
              <v-btn
                class="ml-2"
                color="primary"
                dark
                text
                v-on="on"
              >
                {{ itemsPerPage }}
                <v-icon>mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                v-for="(number, index) in itemsPerPageArray"
                :key="index"
                @click="updateItemsPerPage(number)"
              >
                <v-list-item-title>{{ number }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>

          <v-spacer />

          <span
            class="mr-4
            grey--text"
          >
            Page {{ page }} of {{ numberOfPages }}
          </span>
          <v-btn
            class="mr-1"
            color="primary"
            dark
            fab
            @click="formerPage"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn
            class="ml-1"
            color="primary"
            dark
            fab
            @click="nextPage"
          >
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </v-row>
      </template>
    </v-data-iterator>
  </app-max-width-container>
</template>

<router>
name: PageAdminTranslationsList
</router>

<script>
  import fuzzySearch from "fuzzysearch";
  import {
    mapActions,
    mapState,
  } from "vuex";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";

  export default {
    name: "PageAdminTranslationsList",

    components: {
      AppMaxWidthContainer,
    },

    data() {
      const itemsPerPageArray = [ 8, 12, 16, 24 ];

      const translationData = Object.fromEntries(
        Object
          .entries(this.$store.state.translations.translations)
          .map(
            ([ key, value ]) =>
              [
                key,
                {
                  value,
                  loading: false,
                  error: "",
                },
              ],
          ),
      );

      return {
        itemsPerPageArray,
        search: "",
        page: 1,
        itemsPerPage: itemsPerPageArray[0],
        translationData,
      };
    },

    computed: {
      ...mapState({
        translations: (state) => Object.keys(state.translations.translations),
      }),

      numberOfPages() {
        return Math.ceil(this.translations.length / this.itemsPerPage);
      },
    },

    methods: {
      ...mapActions({
        doUpdateTranslation: "translations/updateTranslation",
      }),

      nextPage() {
        if (this.page + 1 <= this.numberOfPages) {
          this.page += 1;
        }
      },

      formerPage() {
        if (1 <= this.page - 1) {
          this.page -= 1;
        }
      },

      updateItemsPerPage(number) {
        this.itemsPerPage = number;
      },

      customFilter(elements, query) {
        if (!query) {
          return elements;
        }

        const search =
          (haystack) =>
            fuzzySearch(
              query.toLowerCase(),
              String(haystack).toLowerCase(),
            )
        ;

        return (
          Object
            .entries(this.translationData)
            .filter(
              ([ key, { value } ]) =>
                search(key) || search(value),
            )
            .map(([ key ]) => key)
        );
      },

      async saveTranslation(key) {
        const entry = this.translationData[key] || {};
        entry.loading = true;
        entry.error = "";

        try {
          const { error, errorData } = await this.doUpdateTranslation({ key, value: entry.value });

          if (error) {
            entry.error =
              errorData
                ? errorData.join("\n")
                : "Something went wrong. Please try again."
            ;
          }
        } catch (e) {
          entry.error = "Something went wrong. Please try again.";
        } finally {
          entry.loading = false;
        }
      },
    },
  };
</script>
