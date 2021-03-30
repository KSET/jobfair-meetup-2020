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
      <full-student-resume
        :sections="sections"
        as="v-col"
        cols="12"
      />
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

<router>
name: PageCompanyResumeDetails
</router>

<script>
  import {
    mapActions,
    mapGetters,
  } from "vuex";
  import FullStudentResume from "~/components/student/resume/full-resume";
  import CompanyMaxWidthContainer from "~/components/CompanyMaxWidthContainer";
  import TranslatedText from "~/components/TranslatedText";
  import {
    generateMetadata,
  } from "~/helpers/head";

  export default {
    name: "PageCompanyResumeDetails",

    components: {
      FullStudentResume,
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
        sections: "resume/getResumeSections",
      }),

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

      async toggleFavourite() {
        const { resumeId } = this.sections;

        const doToggle = async () => {
          if (this.isFavourite) {
            return await this.removeFromFavourites({ resumeId });
          } else {
            return await this.addToFavourites({ resumeId });
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
      let title = "[Resume]";
      if (this.sections) {
        const { fullName } = this.sections.basicInfo;
        title = `[Resume] ${ fullName.text }`;
      }

      return {
        title,
        meta: [
          ...generateMetadata({
            locale: "hr_HR",
            title,
          }),
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
  }
</style>
