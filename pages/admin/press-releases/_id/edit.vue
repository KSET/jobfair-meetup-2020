<template>
  <PageAdminPressReleaseCreate :release="release" />
</template>
<script>
  import PageAdminPressReleaseCreate from "~/pages/admin/press-releases/new";

  export default {
    name: "PageAdminPressReleaseEdit",

    components: {
      PageAdminPressReleaseCreate,
    },

    async asyncData({ store, params }) {
      const release = await store.dispatch("pressRelease/fetchPressRelease", { id: params.id });

      return {
        release,
      };
    },

    validate({ params, store }) {
      return store.dispatch("pressRelease/fetchPressRelease", { id: params.id, force: true });
    },
  };
</script>
