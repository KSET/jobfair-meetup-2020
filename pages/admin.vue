<template>
  <nuxt-child />
</template>

<script>
  export default {
    middleware: "is-admin",
  };
</script>
