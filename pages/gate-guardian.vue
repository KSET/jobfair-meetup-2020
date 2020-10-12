<template>
  <nuxt-child />
</template>

<script>
  export default {
    layout: "default",

    middleware: [
      "authenticated",
      "has-company",
      "is-gate-guardian",
    ],
  };
</script>
