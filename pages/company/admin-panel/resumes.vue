<template>
  <company-max-width-container>
    <v-row class="mb-n3">
      <v-col cols="auto">
        Svi, Favoriti
      </v-col>

      <v-spacer />

      <v-col class="text-right pb-0" cols="auto">
        <v-row>
          <v-col class="pb-0">
            <div class="d-flex">
              <v-text-field
                v-model="search"

                class="mr-3 mb-n12"
                dense
                flat
                label="Search"
                outlined
                prepend-inner-icon="mdi-magnify"
                single-line
                solo
              />

              <v-btn
                v-ripple
                :class="$style.scanQrBtn"
                class="secondary--text"
                color="primary"
                depressed
                height="40"
              >
                <v-img
                  :src="require('~/assets/images/icons/scan-qr-code.png')"
                  aspect-ratio="1"
                  class="mr-2"
                  contain
                  width="1.25em"
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
          <template v-slot:item="{ item, headers, isMobile }">
            <tr
              v-if="!isMobile"
              :class="$style.tableRow"
              @click="goToInfoView(item)"
            >
              <td
                v-for="header in headers"
                :key="`${item.id}-${header.value}`"
                :class="$style.tableRowEntry"
              >
                {{ item[header.value] }}
              </td>
            </tr>

            <tr
              v-else
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
                <div :class="$style.mobileRowEntryCell">
                  {{ item[header.value] }}
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
  </company-max-width-container>
</template>

<script>
  import CompanyMaxWidthContainer from "~/components/CompanyMaxWidthContainer";
  import {
    hid,
  } from "~/helpers/head";

  export default {
    name: "PageCompanyResumes",

    components: {
      CompanyMaxWidthContainer,
    },

    async asyncData({ store }) {
      return {
        search: "",
        page: 1,
        pageCount: 0,
        itemsPerPage: 10,

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

  .table {

    .tableRow {

      .tableRowEntry {
        font-size: 1em;
        opacity: .6;
      }
    }

    .mobileRow {

      .mobileRowEntry {
        font-size: 1em;
        height: 1em;
        opacity: .6;

        &Header {
          font-weight: 600;
        }

        &Cell {
          text-align: right;
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
