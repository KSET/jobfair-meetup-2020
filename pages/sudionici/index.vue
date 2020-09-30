<template>
  <app-max-width-container>
    <h1 :class="$style.header">
      <translated-text trans-key="participants.header" />
    </h1>

    <v-data-iterator
      v-if="events.length > 0"

      :custom-filter="filterFunction"
      :items="filteredEventsByType"
      :items-per-page.sync="itemsPerPage"
      :page="page"
      :search="filterValue"
      hide-default-footer
    >
      <template v-slot:header>
        <v-row>
          <v-col
            v-for="filter in filterValues"
            :key="filter.name"

            :class="$style.filterContainer"
            :cols="Math.round(12 / filterValues.length)"
            class="d-flex px-2"
          >
            <v-btn
              :class="{
                [$style.filter]: true,
                [$style.filterSelected]: filter.value === filterType
              }"
              text
              tile
              @click="filterType = filter.value"
            >
              <translated-text :trans-key="filter.name" />
            </v-btn>
          </v-col>

          <v-spacer class="d-none d-md-flex" />

          <v-col
            cols="12"
            md="3"
          >
            <v-text-field
              v-model="filterValue"
              :class="$style.search"
              clearable
              color="secondary"
              dense
              hide-details
              label="Search"
              outlined
              prepend-inner-icon="mdi-magnify"
            />
          </v-col>
        </v-row>
      </template>

      <template v-slot:default="props">
        <v-row>
          <v-col
            v-for="event in props.items"
            :key="event.id"
            cols="6"
            md="3"
          >
            <company-participant
              :event="event"
            />
          </v-col>
          <v-col
            v-if="filteredEvents.length === 0"
            cols="12"
          >
            <h2 :class="$style.noEntries">
              <translated-text trans-key="participants.filter.noEntries" />
            </h2>
          </v-col>
        </v-row>
      </template>

      <template v-slot:footer>
        <v-row class="mt-2">
          <v-col
            class="text-center text-md-left"
            cols="12"
            md="6"
            order="2"
            order-md="1"
          >
            <span class="grey--text">Items per page</span>
            <v-menu offset-y>
              <template v-slot:activator="{ on }">
                <v-btn
                  class="ml-2"
                  color="secondary"
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
          </v-col>

          <v-col
            v-if="numberOfPages > 1"
            class="text-center text-md-right"
            cols="12"
            md="6"
            order="1"
            order-md="2"
          >
            <span
              class="mr-4 grey--text"
            >
              Page {{ page }} of {{ numberOfPages }}
            </span>
            <v-btn
              class="mr-1"
              color="secondary"
              dark
              fab
              @click="formerPage"
            >
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <v-btn
              class="ml-1"
              color="secondary"
              dark
              fab
              @click="nextPage"
            >
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </template>
    </v-data-iterator>
    <h2 v-else>
      <translated-text trans-key="participants.no-participants" />
    </h2>
  </app-max-width-container>
</template>

<script>
  import fuzzySearch from "fuzzysearch";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";
  import CompanyParticipant from "~/components/companies/CompanyParticipant";
  import TranslatedText from "~/components/TranslatedText";
  import {
    dotGet,
  } from "~/helpers/data";
  import {
    generateMetadata,
  } from "~/helpers/head";

  export default {
    name: "PageSudionici",

    components: {
      CompanyParticipant,
      TranslatedText,
      AppMaxWidthContainer,
    },

    async asyncData({ store }) {
      return {
        events: (await store.dispatch("companies/fetchParticipantEvents")).sort((a, b) => a.date - b.date),
      };
    },

    data: () => ({
      filterType: null,
      filterValue: "",
      page: 1,
      itemsPerPage: 8,
      itemsPerPageArray: [ 2, 4, 8, 16, 32 ],
      searchFields: [
        "title",
        "location",
        "company.name",
      ],
    }),

    computed: {
      filteredEventsByType() {
        const { filterType, events } = this;

        if (null === filterType) {
          return events;
        }

        return events.filter(({ type }) => type === filterType);
      },

      filteredEvents() {
        return this.filterFunction(this.filteredEventsByType);
      },

      numberOfPages() {
        return Math.ceil(this.filteredEvents.length / this.itemsPerPage);
      },

      filterValues() {
        return [
          {
            name: "participants.filter.all",
            value: null,
          },
          {
            name: "participants.filter.workshops",
            value: "workshop",
          },
          {
            name: "participants.filter.panels",
            value: "panel",
          },
          {
            name: "participants.filter.talks",
            value: "talk",
          },
        ];
      },
    },

    methods: {
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

      filterFunction(elements, query) {
        if (!query) {
          return elements;
        }

        const search =
          (object, key) =>
            fuzzySearch(
              query,
              String(dotGet(object, key) || "").toLowerCase(),
            )
        ;

        return (
          elements.filter(
            (event) =>
              this
                .searchFields
                .find(
                  (field) =>
                    search(event, field)
                  ,
                )
            ,
          )
        );
      },
    },

    head: () => ({
      title: "Sudionici",
      meta: [
        ...generateMetadata({
          title: "Sudionici",
        }),
      ],
    }),
  };
</script>

<style lang="scss" module>
  @import "../../assets/styles/include/all";

  .header {
    font-size: 250%;
    font-weight: 800;
    padding: 1em 0;
    text-align: center;
    color: $fer-dark-blue;
  }

  .filterContainer {
    justify-content: center;

    & + & {
      padding-left: 0;
    }

    .filter {
      $border-bottom-height: 2px;

      align-self: center;
      margin: 0 .8em;
      cursor: pointer;
      transition-timing-function: $transition-timing-function;
      transition-duration: 200ms;
      transition-property: opacity, border-bottom-color;
      opacity: .6;
      color: $fer-black;
      border-bottom: 2px solid transparent;

      &:hover {
        opacity: 1;
      }

      &.filterSelected {
        font-weight: bold;
        margin-bottom: 0;
        opacity: 1;
        color: $fer-dark-blue;
        border-bottom-color: $fer-black;
      }

      @include media(sm) {
        margin: 0 .3em;
        padding-right: .3em !important;
        padding-left: .3em !important;
      }
    }
  }

  .noEntries {
    font-weight: 300;
    margin-left: 1em;
    color: $fer-dark-blue;
  }
</style>
