<template>
  <app-max-width-container>
    <h1 :class="$style.header">
      <translated-text trans-key="participants.header" />
    </h1>

    <v-data-iterator
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
            class="d-flex"
            cols="12"
            md="auto"
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
            <v-card
              :class="$style.cardContainer"
              :to="{ name: 'PageSudioniciInfo', params: { type: event.type, id: event.id } }"
              flat
            >
              <v-img
                :lazy-src="event.company.logo.small.url"
                :src="event.company.logo.original.url"
                :srcset="event.company.logo | srcSet"
                aspect-ratio="1.78"
                class="mx-6"
                contain
              />
              <v-card-subtitle :class="$style.company">
                {{ event.company.name }}
              </v-card-subtitle>
              <v-card-title :class="$style.title">
                {{ event.title }}
              </v-card-title>
              <v-card-text>
                <v-img
                  :class="$style.icon"
                  :src="icons[event.type]"
                  aspect-ratio="1"
                  contain
                />
                {{ event.date | weekday }} | {{ event.date | time }} | {{ event.location || "TBA" }}
              </v-card-text>
            </v-card>
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
        <v-row align="center" class="mt-2" justify="center">
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

          <v-spacer />

          <template v-if="numberOfPages > 1">
            <span
              class="mr-4
            grey--text"
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
          </template>
        </v-row>
      </template>
    </v-data-iterator>
  </app-max-width-container>
</template>

<script>
  import fuzzySearch from "fuzzysearch";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";
  import TranslatedText from "~/components/TranslatedText";
  import {
    dotGet,
  } from "~/helpers/data";
  import {
    generateMetadata,
  } from "~/helpers/head";
  import {
    getSrcSet,
  } from "~/helpers/image";

  export default {
    name: "PageSudionici",

    components: {
      TranslatedText,
      AppMaxWidthContainer,
    },

    filters: {
      srcSet(image) {
        return (
          Object
            .values(image)
            .map(
              ({ width, url }) =>
                `${ url } ${ width }w`
              ,
            )
            .join(",")
        );
      },

      weekday(date) {
        const days = [
          "nedjelja",
          "ponedjeljak",
          "utorak",
          "srijeda",
          "četvrtak",
          "petak",
          "subota",
        ];
        const dateObj = new Date(date);

        return days[dateObj.getDay()];
      },

      time(date) {
        const dateObj = new Date(date);
        const zeroPad = (n) => String(n).padStart(2, "0");
        return `${ zeroPad(dateObj.getHours()) }:${ zeroPad(dateObj.getMinutes()) }`;
      },
    },

    async asyncData({ store }) {
      return {
        events: await store.dispatch("companies/fetchParticipantEvents"),
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
      icons() {
        return {
          talk: require("@/assets/images/icons/talk.png"),
          workshop: require("@/assets/images/icons/workshop.png"),
          panel: require("@/assets/images/icons/panel.png"),
        };
      },

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
      getSrcSet,

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

    & + & {
      padding-top: 0;
    }
  }

  .filter {
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
      opacity: 1;
      color: $fer-dark-blue;
      border-bottom-color: $fer-black;
    }

    @include media(sm) {
      padding-left: .1em !important;
      padding-right: .1em !important;
    }
  }

  .noEntries {
    font-weight: 300;
    margin-left: 1em;
    color: $fer-dark-blue;
  }

  .cardContainer {
    height: 100%;

    .company {
      font-size: 100%;
      font-weight: normal;
      padding-top: .5em;
      padding-bottom: 0;
      text-transform: uppercase;
      opacity: .7;
      color: $fer-black;
    }

    .title {
      font-size: 112.5%;
      font-weight: bold;
      padding-top: 0;
      padding-bottom: 0;
      color: $fer-dark-blue;
    }

    .icon {
      position: relative;
      top: .25em;
      display: inline-block;
      width: 1.2em;
      height: 1.2em;
    }
  }
</style>
