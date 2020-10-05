<template>
  <app-max-width-container>
    <v-row>
      <v-col cols="12">
        <h1>Resume info</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-btn
          :to="{ name: 'PageAdminResumes' }"
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
      <full-student-resume
        :sections="sections"
        as="v-col"
        cols="12"
      />
    </v-row>
  </app-max-width-container>
</template>

<router>
name: PageAdminResumesDetails
</router>

<script>
  import {
    mapGetters,
  } from "vuex";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";
  import FullStudentResume from "~/components/student/resume/full-resume";

  export default {
    components: {
      FullStudentResume,
      AppMaxWidthContainer,
    },

    computed: {
      ...mapGetters({
        sections: "resume/getResumeSections",
      }),
    },
  };
</script>
