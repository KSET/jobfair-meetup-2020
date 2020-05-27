<template>
  <nuxt-child />
</template>

<script>
  export default {

    middleware({ params, error }) {
      switch (params.type) {
        case "workshop":
        case "talk":
        case "panel":
          return true;
        default:
          return error({
            statusCode: 404,
          });
      }
    },

  };
</script>
