<template>
  <app-max-width-container class="py-12 mb-n6 align-self-center">
    <h1 class="text-center">
      <v-progress-circular
        class="mr-3"
        color="primary"
        indeterminate
        size="50"
      />
      Processing...
    </h1>
  </app-max-width-container>
</template>

<script>
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";

  export default {
    components: {
      AppMaxWidthContainer,
    },

    async middleware({ query, store, app, redirect }) {
      const { href: studentPanelHref } = app.router.resolve({ name: "PageStudentIndex" });
      const { href: homeHref } = app.router.resolve({ name: "Index" });

      const user = store.getters["user/getUser"];

      if (user) {
        return redirect(studentPanelHref);
      }

      const { s: token, r: refreshToken } = query;

      const userData = await store.dispatch("user/doRefreshToken", {
        token,
        refreshToken,
      });

      if (!userData) {
        return redirect(homeHref);
      }

      return redirect(studentPanelHref);
    },
  };
</script>
