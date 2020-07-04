<template>
  <nuxt-child />
</template>

<script>
  export default {
    layout: "admin",

    middleware: "is-moderator",
  };
</script>
