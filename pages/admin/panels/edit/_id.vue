<template>
  <edit-skeleton
    :company-list="companyList"
    v-bind="panel"
  />
</template>

<script>
  import {
    mapGetters,
  } from "vuex";
  import EditSkeleton from "~/components/admin/panels/edit-skeleton";

  export default {
    name: "PageAdminPanelsEdit",

    components: {
      EditSkeleton,
    },

    async asyncData({ store }) {
      const companies = await store.dispatch("companies/fetchParticipants");
      const companyList = Object.fromEntries(companies.map((company) => [ company.id, company ]));

      return {
        companyList,
      };
    },

    computed: {
      ...mapGetters({
        panel: "panels/getPanel",
      }),
    },

    validate({ store, params }) {
      return store.dispatch("panels/fetchPanelInfo", { id: params.id });
    },
  };
</script>
