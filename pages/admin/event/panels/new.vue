<template>
  <edit-skeleton
    :company-list="companyList"
    is-new
  />
</template>

<router>
name: PageAdminPanelsNew
</router>

<script>
  import EditSkeleton from "~/components/admin/panels/edit-skeleton";

  export default {
    name: "PageAdminPanelsNew",

    components: {
      EditSkeleton,
    },

    async asyncData({ store }) {
      const companies = await store.dispatch("companies/fetchParticipants");
      const companyList = Object.fromEntries(companies.map((company) => [ company.id, company ]));

      const selectedCompanies = [ "285", "11" ];

      return {
        companyList,

        talk: {
          title: "Neki naslov",
          date: new Date("2020-10-08T14:25:00.000Z").toISOString(),
          companies: selectedCompanies.map((companyId) => ({
            companyId,
            aboutPanelist: `Tu pise nesto o panlistu za ${ companyId } ${ Date.now() }`,
          })),
        },
      };
    },
  };
</script>
