<template>
  <company-max-width-container>
    <v-row class="mb-n3">
      <v-col class="d-flex" cols="12" md="auto" order="2" order-md="1">
        <div class="d-flex flex-row align-self-center">
          <div
            v-for="filter in filterValues"
            :key="filter.name"

            :class="$style.filterContainer"
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
          </div>
        </div>
      </v-col>

      <v-spacer class="d-none d-md-block" style="order: 2;" />

      <v-col class="text-right pb-0" cols="12" md="auto" order="1" order-md="3">
        <v-row>
          <v-col class="pb-0">
            <div class="d-flex">
              <v-text-field
                v-model="search"

                :class="$style.searchInput"
                class="mr-md-3"
                clearable
                dense
                flat
                height="40"
                label="Search"
                outlined
                prepend-inner-icon="mdi-magnify"
                single-line
                solo
              />

              <v-btn
                v-ripple
                :class="$style.scanQrBtn"
                class="secondary--text d-none d-md-flex"
                color="primary"
                depressed
                height="40"
              >
                <v-icon
                  left
                  v-text="'mdi-barcode-scan'"
                />
                Skeniraj QR kod
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-row>
      <v-col class="pt-0" cols="12">
        <v-data-table
          :class="$style.table"
          :headers="headers"
          :items="resumes"
          :items-per-page="itemsPerPage"
          :page.sync="page"
          :search="search"
          hide-default-footer
          item-key="id"
          multi-sort
          @page-count="pageCount = $event"
        >
          <template v-slot:item="{ item, headers }">
            <tr
              :class="$style.tableRow"
              @click="goToInfoView(item)"
            >
              <td
                v-for="header in headers"
                :key="`${item.id}-${header.value}`"
                :class="$style.tableRowEntry"
              >
                <span v-if="header.value === 'isFavourite'">
                  <v-icon
                    v-if="item.isFavourite"
                    style="opacity: .6;"
                    v-text="'mdi-heart'"
                  />
                </span>
                <span v-else>
                  {{ item[header.value] }}
                </span>
              </td>
            </tr>

            <tr
              :class="$style.mobileRow"
              @click="goToInfoView(item)"
            >
              <td
                v-for="header in headers"
                :key="`${item.id}-${header.value}`"
                :class="$style.mobileRowEntry"
                class="v-data-table__mobile-row"
              >
                <div :class="$style.mobileRowEntryHeader">
                  {{ header.text }}
                </div>
                <div
                  :class="{
                    [$style.mobileRowEntryCell]: true,
                    [$style.fullWidth]: header.value === 'isFavourite' && item.isFavourite,
                  }"
                >
                  <span v-if="header.value === 'isFavourite'">
                    <v-icon
                      v-if="item.isFavourite"
                      style="opacity: .6;"
                      v-text="'mdi-heart'"
                    />
                  </span>
                  <span v-else>
                    {{ item[header.value] }}
                  </span>
                </div>
              </td>
            </tr>
          </template>

          <template v-slot:footer="{ props: { pagination } }">
            <footer :class="$style.tableFooter">
              <v-pagination
                v-model="page"
                :class="$style.pagination"
                :length="pagination.pageCount"
                total-visible="10"
              />
            </footer>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <v-footer
      class="d-md-none justify-center px-6 py-4"
      fixed
      padless
    >
      <v-btn
        v-ripple
        :class="$style.scanQrBtn"
        block
        class="secondary--text"
        color="primary"
        depressed
        height="48"
        x-large
      >
        <v-icon
          class="mr-4"
          large
          left
          v-text="'mdi-barcode-scan'"
        />
        Skeniraj QR kod
      </v-btn>
    </v-footer>
  </company-max-width-container>
</template>

<script>
  import CompanyMaxWidthContainer from "~/components/CompanyMaxWidthContainer";
  import TranslatedText from "~/components/TranslatedText";
  import {
    hid,
  } from "~/helpers/head";

  export default {
    name: "PageCompanyResumes",

    components: {
      TranslatedText,
      CompanyMaxWidthContainer,
    },

    async asyncData({ store, route }) {
      return {
        search: route.query.q,
        page: 1,
        pageCount: 0,
        itemsPerPage: 10,

        filterType: null,

        resumeList: await store.dispatch("resume/fetchResumes"),
        favourites: await store.dispatch("resume/listFavourites"),

        headers: [
          {
            text: "Ime i Prezime",
            value: "fullName",
            sortable: true,
          },
          {
            text: "Email",
            value: "email",
            sortable: true,
          },
          {
            text: "",
            value: "isFavourite",
          },
        ],
      };
    },

    computed: {
      resumes() {
        const resumes =
          this
            .resumeList
            .map(
              (resume) =>
                ({
                  ...resume,
                  isFavourite: Boolean(this.favourites[resume.id]),
                })
              ,
            )
        ;

        switch (this.filterType) {
          case "favourites":
            return resumes.filter(({ isFavourite }) => isFavourite);
          default:
            return resumes;
        }
      },

      filterValues() {
        return [
          {
            name: "resumes.filter.all",
            value: null,
          },
          {
            name: "resumes.filter.favourites",
            value: "favourites",
          },
        ];
      },
    },

    watch: {
      search(val) {
        const getUrl = (query) => {
          if (!query) {
            return location.pathname;
          }

          const params = new URLSearchParams(location.search);
          params.set("q", query);

          return `${ location.pathname }?${ params.toString() }`;
        };

        window.history.replaceState({}, "", getUrl(val));
      },
    },

    methods: {
      goToInfoView(item) {
        return this.$router.push(this.getItemLink(item));
      },

      getItemLink(item) {
        return {
          name: "PageCompanyResumeDetails",
          params: {
            resumeId: item.id,
          },
        };
      },
    },

    head() {
      return {
        title: "Baza životopisa",
        meta: [
          hid({ name: "og:locale", content: "hr_HR" }),
        ],
      };
    },
  };
</script>

<style lang="scss" module>
  @import "../../../assets/styles/include/all";

  .scanQrBtn {
    font-weight: 600;
  }

  .searchInput {
    min-width: 269px;
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

  .table {

    .tableRow {
      display: table-row;

      @include media(sm) {
        display: none;
      }

      .tableRowEntry {
        font-size: 1em;
        opacity: .6;
      }
    }

    .mobileRow {
      display: none;

      @include media(sm) {
        display: table-row;
      }

      .mobileRowEntry {
        font-size: 1em;
        height: 1em;
        opacity: .6;

        &Header {
          font-weight: 600;
        }

        &Cell {
          text-align: right;

          &.fullWidth {
            width: 100%;
            text-align: center;
          }
        }
      }

      .mobileRowEntry + .mobileRowEntry {
        margin-top: -.69em;
      }
    }

    .tableRow,
    .mobileRow {
      cursor: pointer;
    }

    .tableFooter {
      opacity: .9;
      border-top: 1px solid transparentize(black, .6);

      .pagination {

        :global(.v-pagination) {
          justify-content: left;

          :global(li) > :global(button) {
            font-weight: normal;
            min-width: 1em;
            margin: 0 .2em;
            padding: 0;
            color: transparentize($fer-dark-blue, .3) !important;
            background-color: transparent !important;
            box-shadow: none;

            &:global(.v-pagination__item--active) {
              font-weight: bold;
              color: $fer-dark-blue !important;
            }

            &:global(.v-pagination__navigation) {
              color: $fer-dark-blue !important;

              > :global(.v-icon) {
                color: inherit;
              }
            }
          }
        }
      }
    }
  }
</style>
