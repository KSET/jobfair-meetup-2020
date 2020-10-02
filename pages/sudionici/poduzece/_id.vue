<template>
  <company-max-width-container :class="$style.container">
    <company-info-page :company="company" />
  </company-max-width-container>
</template>

<script>
  import {
    mapGetters,
  } from "vuex";
  import CompanyInfoPage from "~/components/company/info";
  import CompanyMaxWidthContainer from "~/components/CompanyMaxWidthContainer";
  import {
    generateMetadata,
  } from "~/helpers/head";

  export default {
    name: "PageSudioniciCompanyInfo",

    components: {
      CompanyMaxWidthContainer,
      CompanyInfoPage,
    },

    computed: {
      ...mapGetters({
        company: "companies/getCompany",
      }),
    },

    async validate({ store, params }) {
      return await store.dispatch("companies/fetchInfo", { id: params.id });
    },

    head() {
      let title = "Company info";
      if (this.company) {
        title = this.company.name;
      }

      return {
        title,
        meta: [
          ...generateMetadata({
            title,
            "og:locale": "hr_HR",
          }),
        ],
      };
    },
  };
</script>

<style lang="scss" module>
  @import "../../../assets/styles/include/all";

  .container {
    margin-top: 3em;
  }
</style>
