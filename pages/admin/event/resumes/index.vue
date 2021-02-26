<template>
  <app-max-width-container>
    <v-row>
      <v-col cols="12">
        <h1>Resumes</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-btn
          :to="{ name: 'PageAdminEventIndex' }"
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
        <v-row class="mb-n3">
          <v-col class="align-self-center ml-md-3 font-weight-light text--secondary" cols="auto">
            <v-row>
              <v-col class="py-1" cols="12">
                Total: {{ resumes.length }}
              </v-col>
              <v-col class="py-1" cols="12">
                <div
                  class="d-inline-block"
                  :style="`width: ${daysAgoInputWidth}px;`"
                >
                  <v-text-field
                    v-model="daysAgo"
                    :class="$style.daysAgoInput"
                    type="number"
                    prefix="Last"
                    :suffix="`${daysAgoSuffix}: `"
                  />
                </div>
                <span class="pl-1" />
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <span
                      v-bind="attrs"
                      v-on="on"
                      v-text="resumesFromLastWeek.updated"
                    />
                  </template>
                  Updated
                </v-tooltip>
                +
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <span
                      v-bind="attrs"
                      v-on="on"
                      v-text="resumesFromLastWeek.created"
                    />
                  </template>
                  Created (new)
                </v-tooltip>
                =
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <span
                      v-bind="attrs"
                      v-on="on"
                      v-text="resumesFromLastWeek.total"
                    />
                  </template>
                  Total (active)
                </v-tooltip>
              </v-col>
            </v-row>
          </v-col>

          <v-spacer />

          <v-col class="text-right pb-0" cols="auto">
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
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<router>
name: PageAdminResumes
</router>

<script>
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";
  import {
    hid,
  } from "~/helpers/head";

  const getUrl = (query, param) => {
    const params = new URLSearchParams(location.search);

    if (query) {
      params.set(param, query);
    } else {
      params.delete(param);
    }

    let queryString = params.toString();
    if (queryString) {
      queryString = `?${ queryString }`;
    }

    return `${ location.pathname }${ queryString }`;
  };

  export default {
    name: "PageAdminResumesIndex",

    components: {
      AppMaxWidthContainer,
    },

    async asyncData({ store, route }) {
      const {
        q: search,
        p: rawPage = 1,
      } = route.query;

      return {
        search,
        page: Number(rawPage),
        pageCount: 0,
        itemsPerPage: 10,

        daysAgo: 7,

        resumes: await store.dispatch("resume/fetchResumes"),

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
        ],
      };
    },

    computed: {
      resumesFromLastWeek() {
        const nDaysAgo = new Date();
        nDaysAgo.setDate(nDaysAgo.getDate() - this.daysAgoBound);

        const created = this.resumes.filter(({ createdAt }) => new Date(createdAt) >= nDaysAgo).length;
        const updated = this.resumes.filter(({ updatedAt }) => new Date(updatedAt) >= nDaysAgo).length - created;
        const total = created + updated;

        return {
          updated,
          created,
          total,
        };
      },

      daysAgoSuffix() {
        if (1 < this.daysAgoBound) {
          return "days";
        } else {
          return "day";
        }
      },

      daysAgoBound() {
        if (1 > this.daysAgo) {
          return 1;
        }

        return this.daysAgo;
      },

      daysAgoInputWidth() {
        return 96 + String(this.daysAgoBound).length * 8;
      },
    },

    watch: {
      search(val) {
        window.history.replaceState({}, "", getUrl(val, "q"));
      },

      page(val) {
        if (1 === val) {
          val = null;
        }

        window.history.replaceState({}, "", getUrl(val, "p"));
      },
    },

    methods: {
      goToInfoView(item) {
        return this.$router.push(this.getItemLink(item));
      },

      getItemLink(item) {
        return {
          name: "PageAdminResumesDetails",
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
  @import "assets/styles/include/all";

  .container {
    @include media(sm) {
      margin-bottom: 45px;
    }
  }

  .daysAgoInput {

    :global(.v-input__slot) {

      &::before,
      &::after {
        display: none;
      }
    }
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

          @include media(sm) {
            justify-content: center;
          }

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
