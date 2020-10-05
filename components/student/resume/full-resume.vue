<template>
  <div
    :is="as"
    :class="$style.container"
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
  </div>
</template>
<script>
  import BasicInfoTable from "~/components/student/resume/basic-info-table";
  import InfoTable from "~/components/student/resume/info-table";
  import PdfViewer from "~/components/student/resume/pdf-viewer";
  import TranslatedText from "~/components/TranslatedText";

  export default {
    name: "FullStudentResume",

    components: {
      PdfViewer,
      InfoTable,
      BasicInfoTable,
      TranslatedText,
    },

    props: {
      sections: {
        type: Object,
        required: true,
      },

      as: {
        type: String,
        default: "div",
      },
    },
  };
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  .container {
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
</style>
