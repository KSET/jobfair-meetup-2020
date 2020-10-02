<template>
  <nuxt-child />
</template>

<script>
  export default {
    layout: "company",

    middleware: [
      "authenticated",
      "has-company",
    ],
  };
</script>
