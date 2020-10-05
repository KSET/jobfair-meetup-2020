<template>
  <company-max-width-container :class="$style.container">
    <v-row>
      <v-col cols="12" md="6">
        <v-breadcrumbs :class="$style.breadcrumbs" :items="breadcrumbItems" class="pl-0">
          <template v-slot:item="{ item }">
            <v-breadcrumbs-item
              :disabled="item.disabled"
              :href="item.href"
              :to="item.to"
            >
              <translated-text v-if="item.transKey" :trans-key="item.transKey" />
              <span v-else v-text="item.text" />
            </v-breadcrumbs-item>
          </template>
        </v-breadcrumbs>
      </v-col>

      <v-col class="text-center text-md-right pt-6" cols="12" md="6">
        <v-btn
          :loading="favouriteLoading"
          :ripple="{ class: 'primary--text' }"
          color="secondary"
          large
          outlined
          style="border: none;"
          @click.prevent="toggleFavourite"
        >
          <v-slide-y-transition
            leave-absolute
          >
            <v-icon
              v-if="!isFavourite"
              key="mdi-heart-outline"
              class="mr-4"
              large
              left
              v-text="'mdi-heart-outline'"
            />
            <v-icon
              v-else
              key="mdi-heart-broken-outline"
              class="mr-4"
              large
              left
              v-text="'mdi-heart-broken-outline'"
            />
          </v-slide-y-transition>

          <translated-text
            :trans-key="isFavourite ? 'company.adminPanel.resumes.favourites.remove' : 'company.adminPanel.resumes.favourites.add'"
          />
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        :class="$style.sectionsContainer"
        cols="12"
      >
        <v-row>
          <v-col cols="12">
            <h2 :class="$style.sectionTitle">
              <translated-text trans-key="company.adminPanel.resumes.basicInfo.title" />
            </h2>
          </v-col>

          <v-col class="py-0" cols="12">
            <v-divider />
          </v-col>

          <v-col cols="12">
            <basic-info-table
              :basic-info="sections.basicInfo"
            />
          </v-col>
        </v-row>

        <v-row v-if="sections.education.values.length">
          <v-col cols="12">
            <h2 :class="$style.sectionTitle">
              <translated-text trans-key="company.adminPanel.resumes.education.title" />
            </h2>
          </v-col>

          <v-col class="py-0" cols="12">
            <v-divider />
          </v-col>

          <v-col class="pt-1" cols="12">
            <info-table
              v-bind="sections.education"
            />
          </v-col>
        </v-row>

        <v-row v-if="sections.projects.values.length">
          <v-col cols="12">
            <h2 :class="$style.sectionTitle">
              <translated-text trans-key="company.adminPanel.resumes.projects.title" />
            </h2>
          </v-col>

          <v-col class="py-0" cols="12">
            <v-divider />
          </v-col>

          <v-col class="pt-1" cols="12">
            <info-table
              v-bind="sections.projects"
            />
          </v-col>
        </v-row>

        <v-row v-if="sections.technicalSkills.length">
          <v-col cols="12">
            <h2 :class="$style.sectionTitle">
              <translated-text trans-key="company.adminPanel.resumes.technicalSkills.title" />
            </h2>
          </v-col>

          <v-col class="py-0" cols="12">
            <v-divider />
          </v-col>

          <v-col cols="12">
            <v-row :class="$style.section">
              <v-col
                v-for="skill in sections.technicalSkills"
                :key="skill"
                class="py-2"
                cols="12"
              >
                <span :class="$style.sectionValue">
                  {{ skill }}
                </span>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <v-row v-if="sections.otherSkills.length">
          <v-col cols="12">
            <h2 :class="$style.sectionTitle">
              <translated-text trans-key="company.adminPanel.resumes.otherSkills.title" />
            </h2>
          </v-col>

          <v-col class="py-0" cols="12">
            <v-divider />
          </v-col>

          <v-col cols="12">
            <v-row :class="$style.section">
              <v-col
                v-for="skill in sections.otherSkills"
                :key="skill"
                class="py-2"
                cols="12"
              >
                <span :class="$style.sectionValue">
                  {{ skill }}
                </span>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <v-row v-if="sections.awards.values.length">
          <v-col cols="12">
            <h2 :class="$style.sectionTitle">
              <translated-text trans-key="company.adminPanel.resumes.awards.title" />
            </h2>
          </v-col>

          <v-col class="py-0" cols="12">
            <v-divider />
          </v-col>

          <v-col class="pt-1" cols="12">
            <info-table
              v-bind="sections.awards"
            />
          </v-col>
        </v-row>

        <v-row v-if="sections.languages.values.length">
          <v-col cols="12">
            <h2 :class="$style.sectionTitle">
              <translated-text trans-key="company.adminPanel.resumes.languages.title" />
            </h2>
          </v-col>

          <v-col class="py-0" cols="12">
            <v-divider />
          </v-col>

          <v-col class="pt-1" cols="12">
            <info-table
              v-bind="sections.languages"
            />
          </v-col>
        </v-row>

        <v-row v-if="sections.resume">
          <v-col class="d-flex" cols="12">
            <h2 :class="$style.sectionTitle" class="d-inline-block">
              <translated-text trans-key="company.adminPanel.resumes.resume.title" />
            </h2>

            <v-spacer />

            <span class="d-inline-flex" style="align-items: flex-end;">
              <a
                :class="[$style.downloadLink, $style.title]"
                :href="sections.resume"
                rel="noopener noreferrer"

                target="_blank"
              >
                <v-icon :class="$style.downloadIcon">mdi-download</v-icon>
                <translated-text trans-key="company.adminPanel.resumes.resume.download" />
              </a>
            </span>
          </v-col>

          <v-col class="py-0" cols="12">
            <v-divider />
          </v-col>

          <v-col cols="12">
            <a
              :class="[$style.downloadLink, $style.underTitle]"
              :href="sections.resume"
              rel="noopener noreferrer"

              target="_blank"
            >
              <v-icon :class="$style.downloadIcon">mdi-download</v-icon>
              <translated-text trans-key="company.adminPanel.resumes.resume.download" />
            </a>

            <pdf-viewer
              :class="$style.resume"

              :url="sections.resume"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-snackbar
      v-model="snackbar.open"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.text }}

      <template v-slot:action="{ attrs }">
        <v-btn
          v-bind="attrs"
          :color="snackbar.type"
          text
          @click="snackbar.open = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </company-max-width-container>
</template>

<script>
  import {
    mapActions,
    mapGetters,
  } from "vuex";
  import BasicInfoTable from "~/components/student/resume/basic-info-table";
  import {
    EntryType,
  } from "~/components/student/resume/entry-type";
  import InfoTable from "~/components/student/resume/info-table";
  import PdfViewer from "~/components/student/resume/pdf-viewer";
  import CompanyMaxWidthContainer from "~/components/CompanyMaxWidthContainer";
  import TranslatedText from "~/components/TranslatedText";
  import {
    hid,
  } from "~/helpers/head";

  export default {
    name: "PageCompanyResumeDetails",

    components: {
      PdfViewer,
      InfoTable,
      BasicInfoTable,
      TranslatedText,
      CompanyMaxWidthContainer,
    },

    async asyncData({ store, params }) {
      const favourites = await store.dispatch("resume/listFavourites");

      return {
        isFavourite: favourites[params.resumeId],
        favouriteLoading: false,
        snackbar: {
          open: false,
          text: "",
          type: "error",
          timeout: 2000,
        },
      };
    },

    computed: {
      ...mapGetters({
        resume: "resume/getResume",
        sections: "resume/getResumeSections",
      }),

      EntryType() {
        return EntryType;
      },

      breadcrumbItems() {
        const { fullName } = this.sections.basicInfo;

        return [
          {
            transKey: "page.company.adminPanel.resumes",
            disabled: false,
            to: {
              name: "PageCompanyResumes",
            },
          },
          {
            text: fullName.text,
            disabled: true,
            href: "#",
          },
        ].map((item) => {
          if (!item.text) {
            item.text = item.transKey;
          }

          return item;
        });
      },
    },

    methods: {
      ...mapActions({
        addToFavourites: "resume/addToFavourites",
        removeFromFavourites: "resume/removeFromFavourites",
      }),

      formatUrl(url) {
        try {
          const { protocol } = new URL(url);

          if (!protocol) {
            return url;
          }

          return url.substr(protocol.length + 2);
        } catch {
          return url;
        }
      },

      async toggleFavourite() {
        const doToggle = async () => {
          if (this.isFavourite) {
            return await this.removeFromFavourites({ resumeId: this.resume.id });
          } else {
            return await this.addToFavourites({ resumeId: this.resume.id });
          }
        };
        this.snackbar.open = false;
        this.snackbar.text = "";

        this.favouriteLoading = true;
        const { error } = await doToggle();
        this.favouriteLoading = false;

        if (!error) {
          this.isFavourite = !this.isFavourite;
        } else {
          this.snackbar.text = "Something went wrong. Please try again.";
          this.snackbar.open = true;
        }
      },
    },

    head() {
      return {
        title: "Resume",
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

    .breadcrumbs {

      :global(.v-breadcrumbs__item) {
        font-weight: 600;
        color: $fer-dark-blue;

        &:not(:global(.v-breadcrumbs__item--disabled)) {
          opacity: .7;
        }
      }
    }

    .sectionsContainer {
      color: $fer-dark-blue;

      > * + * {
        margin-top: 2.5em;
      }

      .sectionTitle {
        font-weight: bold;
        margin-bottom: -.2em;
        color: $fer-dark-blue;
      }

      .section {

        .sectionValue {
          font-weight: 600;
          opacity: .8;
          color: $fer-black;
        }
      }

      .downloadLink {
        text-decoration: none;
        color: inherit;

        &.title {
          display: inline-flex;

          @include media(sm) {
            display: none;
          }
        }

        &.underTitle {
          display: none;
          margin-bottom: 1em;

          @include media(sm) {
            display: block;
          }
        }

        .downloadIcon {
          transition-timing-function: $transition-bounce-function;
          transition-duration: 350ms;
          transition-property: transform;
          transform: translateY(0);
          color: inherit;
        }

        &:hover {

          .downloadIcon {
            transform: translateY(2px);
          }
        }

        &:active {

          .downloadIcon {
            transform: translateY(5px);
          }
        }
      }

      .resume {
        overflow: auto;
        width: 100%;
        min-height: 250px;
        max-height: calc(100vh - #{$nav-height} - 50px);
        border-radius: 4px;
      }
    }
  }
</style>
