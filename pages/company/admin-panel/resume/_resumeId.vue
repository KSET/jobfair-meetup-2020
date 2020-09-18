<template>
  <company-max-width-container :class="$style.container">
    <v-row>
      <v-col cols="12" md="6">
        <v-breadcrumbs :items="breadcrumbItems">
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

      <v-col cols="12" md="6">
        <span>Dodaj u favorite</span>
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
            <table :class="[$style.section, $style.sectionTable]">
              <tbody>
                <tr
                  v-for="(value, key) in sections.basicInfo"
                  :key="`basicInfo:${key}`"
                >
                  <td>
                    <translated-text
                      :class="$style.sectionKey"
                      :trans-key="`company.adminPanel.resumes.basicInfo.${key}`"
                    />
                  </td>

                  <td>
                    <basic-info-value
                      :class="$style.sectionValue"
                      :entry="value"
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            <v-row :class="[$style.section, $style.sectionStaggered]">
              <v-col
                v-for="(value, key) in sections.basicInfo"
                :key="`basicInfo:${key}`"
                cols="12"
              >
                <div>
                  <translated-text
                    :class="$style.sectionKey"
                    :trans-key="`company.adminPanel.resumes.basicInfo.${key}`"
                  />
                </div>

                <div>
                  <basic-info-value
                    :class="$style.sectionValue"
                    :entry="value"
                  />
                </div>
              </v-col>
            </v-row>
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
  </company-max-width-container>
</template>

<script>
  import {
    mapGetters,
  } from "vuex";
  import BasicInfoValue from "~/components/company/admin-panel/resume/basic-info-value";
  import {
    EntryType,
  } from "~/components/company/admin-panel/resume/entry-type";
  import InfoTable from "~/components/company/admin-panel/resume/info-table";
  import PdfViewer from "~/components/company/admin-panel/resume/pdf-viewer";
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
      BasicInfoValue,
      TranslatedText,
      CompanyMaxWidthContainer,
    },

    data() {
      const resume = this.$store.getters["resume/getResume"];
      const resumeUrl = this.$store.getters["resume/getResumeUrl"];

      const breadcrumbItems =
        [
          {
            transKey: "page.company.adminPanel.resumes",
            disabled: false,
            to: {
              name: "PageCompanyResumes",
            },
          },
          {
            text: resume.fullName,
            disabled: true,
            href: "#",
          },
        ].map((item) => {
          if (!item.text) {
            item.text = item.transKey;
          }

          return item;
        })
      ;

      const basicInfo = Object.fromEntries(Object.entries({
        fullName: {
          text: resume.fullName,
        },
        city: {
          text: resume.city,
        },
        birthday: {
          text: resume.birthday,
          type: EntryType.Date,
        },
        phone: {
          text: resume.phone,
          type: EntryType.Phone,
        },
        email: {
          text: resume.email,
          type: EntryType.Email,
        },
        githubUrl: {
          text: resume.githubUrl,
          type: EntryType.Url,
        },
        linkedinUrl: {
          text: resume.linkedinUrl,
          type: EntryType.Url,
        },
      }).filter(([ , { text } ]) => text));

      return {
        breadcrumbItems,

        sections: {
          basicInfo,
          education: {
            headers: [ "Obrazovna institucija", "Usmjerenje", "Godina završetka" ],
            values: resume.educations.map(({ awardedTitle, module, name, year }) => [ name, module, year ]),
          },
          projects: {
            headers: [ "Tvrtka/projekt", "Pozicija", "Trajanje" ],
            values: resume.workExperiences.map(({ company, description, years }) => [ company, description, years ]),
          },
          technicalSkills: resume.computerSkills,
          otherSkills: resume.skills,
          languages: {
            headers: [ "Jezik", "Razina" ],
            values: resume.languages,
          },
          awards: {
            headers: [ "Award", "Godina" ],
            values: resume.awards,
          },
          resume: resumeUrl,
        },
      };
    },

    computed: {
      ...mapGetters({
        resume: "resume/getResume",
      }),

      EntryType() {
        return EntryType;
      },
    },

    methods: {
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

        &.sectionTable {
          display: table;
          margin: -1.5em 0;
          border-spacing: 0 1.5em;
          border-collapse: separate;

          @include media(sm) {
            display: none;
          }
        }

        &.sectionStaggered {
          display: none;

          @include media(sm) {
            display: block;
          }
        }

        .sectionKey,
        .sectionValue {
          font-weight: 600;
          color: $fer-black;
        }

        .sectionKey {
          margin-right: 4em;
          text-transform: uppercase;
          opacity: .6;
        }

        .sectionValue {
          opacity: .8;
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
        height: 475px;
        border-radius: 4px;
      }
    }
  }
</style>
