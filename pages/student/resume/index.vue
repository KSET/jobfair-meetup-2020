<template>
  <app-max-width-container :class="$style.pageContainer">
    <v-row>
      <v-col cols="12">
        <h1
          :class="$style.header"
          class="mb-4"
        >
          <translated-text
            trans-key="studentResume.title"
          />
        </h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <div>
          <h2
            :class="$style.subHeader"
          >
            <translated-text
              trans-key="studentResume.subtitle.text"
            />
          </h2>
          <h3
            :class="$style.subHeaderNote"
          >
            <translated-text
              trans-key="studentResume.subtitle.subText"
            />
          </h3>
        </div>
      </v-col>
    </v-row>

    <v-form
      @submit.prevent="handleSubmit"
    >
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.city"
            clearable
            label="Grad"
            outlined
            placeholder="Zagreb"
          />
        </v-col>

        <v-col cols="12" md="6">
          <menu-date-picker
            v-model="form.birthday"
            label="Datum rođenja"
            outlined
            placeholder="14. 7. 1998."
          />
        </v-col>

        <v-col cols="12">
          <v-text-field
            v-model="form.linkedinUrl"
            clearable
            label="Linkedin url"
            outlined
            placeholder="https://www.linkedin.com/company/JobFairFER/"
          />
        </v-col>

        <v-col cols="12">
          <v-text-field
            v-model="form.githubUrl"
            clearable
            label="GitHub url"
            outlined
            placeholder="https://github.com/KSET"
          />
        </v-col>

        <v-col cols="12">
          <v-text-field
            v-model="form.suggestion"
            clearable
            label="Prijedlog slogana Job Fair Meetupa"
            outlined
            placeholder="Ulovi karijeru dolaskom na Meetup!"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col
          class="pb-0"
          cols="12"
        >
          <h3
            :class="$style.subsectionHeader"
          >
            <translated-text
              trans-key="studentResume.section.resume.header"
            />
          </h3>
        </v-col>

        <v-col
          class="pt-0"
          cols="12"
        >
          <v-file-input
            v-model="form.file"
            accept="application/pdf"
            clearable
            placeholder="Ako već imate pripremljen PDF, slobodno ga prenesite ovdje"
            show-size
          />
        </v-col>
      </v-row>

      <subsection-skeleton
        name="educations"
        @addItem="adders.educations()"
      >
        <education-entry
          v-for="item in form.educations"
          :key="item.id"
          :item="item"
          @change="(newItem) => Object.assign(item, newItem)"
          @removeEntry="form.educations = form.educations.filter((i) => i !== item)"
        />
      </subsection-skeleton>

      <subsection-skeleton
        name="workExperiences"
        @addItem="adders.workExperiences()"
      >
        <work-experience-entry
          v-for="item in form.workExperiences"
          :key="item.id"
          :item="item"
          @change="(newItem) => Object.assign(item, newItem)"
          @removeEntry="form.workExperiences = form.workExperiences.filter((i) => i !== item)"
        />
      </subsection-skeleton>

      <subsection-skeleton
        name="computerSkills"
        @addItem="adders.computerSkills()"
      >
        <computer-skills-entry
          v-for="item in form.computerSkills"
          :key="item.id"
          :item="item"
          @change="(newItem) => Object.assign(item, newItem)"
          @removeEntry="form.computerSkills = form.computerSkills.filter((i) => i !== item)"
        />
      </subsection-skeleton>

      <subsection-skeleton
        name="skills"
        @addItem="adders.skills()"
      >
        <skills-entry
          v-for="item in form.skills"
          :key="item.id"
          :item="item"
          @change="(newItem) => Object.assign(item, newItem)"
          @removeEntry="form.skills = form.skills.filter((i) => i !== item)"
        />
      </subsection-skeleton>

      <subsection-skeleton
        name="languages"
        @addItem="adders.languages()"
      >
        <language-entry
          v-for="item in form.languages"
          :key="item.id"
          :item="item"
          @change="(newItem) => Object.assign(item, newItem)"
          @removeEntry="form.languages = form.languages.filter((i) => i !== item)"
        />
      </subsection-skeleton>

      <subsection-skeleton
        name="awards"
        @addItem="adders.awards()"
      >
        <awards-entry
          v-for="item in form.awards"
          :key="item.id"
          :item="item"
          @change="(newItem) => Object.assign(item, newItem)"
          @removeEntry="form.awards = form.awards.filter((i) => i !== item)"
        />
      </subsection-skeleton>

      <v-row>
        <v-col class="text-center" cols="12">
          <v-btn
            :class="$style.submitBtn"
            color="secondary"
            large
            type="submit"
          >
            <translated-text trans-key="studentResume.btn.submit" />
          </v-btn>
        </v-col>
      </v-row>
    </v-form>

    <v-snackbar
      v-model="meta.snackbar"
      :multi-line="true"
      :timeout="5000"
      color="error darken-1"
      right
      top
      vertical
    >
      {{ meta.error }}

      <template v-slot:action="{ attrs }">
        <v-btn
          v-bind="attrs"
          color="white"
          outlined
          @click="meta.snackbar = false"
        >
          Zatvori
        </v-btn>
      </template>
    </v-snackbar>
  </app-max-width-container>
</template>

<router>
name: PageStudentResumeHome
</router>

<script>
  import {
    mapActions,
  } from "vuex";
  import isString from "lodash/fp/isString";
  import isArray from "lodash/fp/isArray";
  import AppMaxWidthContainer from "../../../components/AppMaxWidthContainer";
  import MenuDatePicker from "../../../components/student/resume/form/menu-date-picker";
  import AwardsEntry from "../../../components/student/resume/form/sections/awards-entry";
  import ComputerSkillsEntry from "../../../components/student/resume/form/sections/computer-skills-entry";
  import EducationEntry from "../../../components/student/resume/form/sections/education-entry";
  import LanguageEntry from "../../../components/student/resume/form/sections/language-entry";
  import SkillsEntry from "../../../components/student/resume/form/sections/skills-entry";
  import WorkExperienceEntry from "../../../components/student/resume/form/sections/work-experience-entry";
  import SubsectionSkeleton from "../../../components/student/resume/form/subsection-skeleton";
  import TranslatedText from "../../../components/TranslatedText";
  import {
    generateMetadata,
  } from "../../../helpers/head";

  function jsonToFormData(data) {
    const formData = new FormData();

    const buildFormData = (formData, data, parentKey) => {
      if (
        !data ||
        "object" !== typeof data ||
        data instanceof Date ||
        data instanceof File
      ) {
        const value = null === data ? "" : data;

        formData.append(parentKey, value);

        return;
      }

      for (const key of Object.keys(data)) {
        buildFormData(
          formData,
          data[key],
          parentKey ? `${ parentKey }[${ key }]` : key,
        );
      }
    };

    buildFormData(formData, data);

    return formData;
  }

  export default {
    components: {
      SubsectionSkeleton,
      AwardsEntry,
      LanguageEntry,
      SkillsEntry,
      ComputerSkillsEntry,
      WorkExperienceEntry,
      EducationEntry,
      MenuDatePicker,
      TranslatedText,
      AppMaxWidthContainer,
    },

    data() {
      const emptyResume = {
        city: "",
        birthday: null,
        linkedinUrl: "",
        githubUrl: "",
        suggestion: "",
        file: null,
        educations: [],
        workExperiences: [],
        computerSkills: [],
        skills: [],
        languages: [],
        awards: [],
      };

      const storeResume = this.$store.getters["user/getResume"];

      let i = 0;
      const id = () => `${ Date.now().toString(36) }${ Math.random().toString(36) }.${ i++ }`;

      const addIdToValue =
        (val) =>
          isString(val)
            ? ({
              name: val,
              id: id(),
            })
            : ({
              ...val,
              id: id(),
            })
      ;

      const baseResume = Object.fromEntries(
        Object
          .entries({
            ...emptyResume,
            ...storeResume,
          })
          .map(([ key, value ]) => [
            key,
            isArray(value)
              ? value.map(addIdToValue)
              : value,
          ])
        ,
      );

      return {
        form: baseResume,
        meta: {
          snackbar: false,
          error: "",
        },
      };
    },

    computed: {
      adders() {
        const id = () => `${ Date.now().toString(36) }${ Math.random().toString(36) }`;

        return {
          educations: ({ name = "", year = "", module = "" } = {}) => {
            this.form.educations.push({
              id: id(),
              name,
              year,
              module,
            });
          },
          workExperiences: ({ company = "", years = "", description = "", currentEmployer = false } = {}) => {
            this.form.workExperiences.push({
              id: id(),
              company,
              years,
              description,
              currentEmployer,
            });
          },
          computerSkills: (name = "") => {
            this.form.computerSkills.push({
              id: id(),
              name,
            });
          },
          skills: (name = "") => {
            this.form.skills.push({
              id: id(),
              name,
            });
          },
          languages: ({ name = "", skillLevel = "B2" } = {}) => {
            this.form.languages.push({
              id: id(),
              name,
              skillLevel,
            });
          },
          awards: ({ title = "", year = "" } = {}) => {
            this.form.awards.push({
              id: id(),
              title,
              year,
            });
          },
        };
      },
    },

    methods: {
      ...mapActions("resume", [
        "submitResume",
      ]),

      async handleSubmit() {
        const formData = jsonToFormData(this.form);

        const { error = true, reason, errorData } = await this.submitResume(formData);

        if (!error) {
          return await this.$router.push({
            name: "PageStudentIndex",
          });
        }

        this.meta.error =
          reason ||
          (
            errorData
              ? errorData.join("\n")
              : "Something went wrong"
          )
        ;
        this.meta.snackbar = true;
      },
    },

    head() {
      const title = "Predaja životopisa";

      return {
        title,
        meta: [
          ...generateMetadata({
            title,
            locale: "hr",
          }),
        ],
      };
    },
  };
</script>


<style lang="scss" module>
  @import "assets/styles/include/all";

  .pageContainer {

    .header {
      font-size: 250%;
      font-weight: 800;
      margin: 1em auto;
      text-align: center;
      text-transform: uppercase;
      color: $fer-dark-blue;
    }

    .subHeader {
      font-size: 250%;
      font-weight: normal;
      margin-bottom: 0;
      text-align: center;
      color: $fer-dark-blue;
    }

    .subHeaderNote {
      font-size: 150%;
      font-weight: normal;
      text-align: center;
      color: $fer-black;
    }

    .subsectionHeader {
      font-size: 200%;
      font-weight: normal;
      text-align: left;
      color: $fer-black;
    }

    :global(.v-input) {

      :global(.v-label) {
        font-size: 1.3em;
        overflow: visible;
        color: $fer-black;
      }
    }

    .submitBtn {
      @include media(md) {
        display: flex;
        flex: 1 0 auto;
        min-width: 100% !important;
        max-width: unset;
        margin-top: 1.5rem;
      }
    }
  }
</style>
