<template>
  <nuxt-child />
</template>

<script>
  export default {
    layout: "default",

    middleware: [ "authenticated", "is-student" ],
  };
</script>
