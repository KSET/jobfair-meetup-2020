<template>
  <nuxt-child />
</template>

<script>
  export default {
    async middleware({ params, store, error }) {
      const { resumeId } = params;
      const resume = await store.dispatch("resume/fetchResume", { resumeId });

      if (!resume) {
        return error({
          statusCode: 404,
        });
      }
    },
  };
</script>
