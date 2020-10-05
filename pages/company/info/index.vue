<template>
  <app-max-width-container>
    <company-info-page :company="company" />
  </app-max-width-container>
</template>

<router>
name: PageCompanyViewInfo
</router>

<script>
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";
  import CompanyInfoPage from "~/components/company/info";

  export default {
    name: "PageCompanyViewInfo",

    components: {
      CompanyInfoPage,
      AppMaxWidthContainer,
    },

    async asyncData({ store }) {
      const { id } = store.getters["user/getCompany"];
      const company = await store.dispatch("companies/fetchInfo", { id });

      return {
        company,
      };
    },
  };
</script>
