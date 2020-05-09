<template>
  <div class="container">
    <div>
      <logo />
      <h1 class="title">
        jobfair-meetup
      </h1>
      <h2 class="subtitle">
        JobFair meetup site
      </h2>
      <div class="links">
        <a
          class="button--green"
          href="https://nuxtjs.org/"
          target="_blank"
        >
          Documentation
        </a>
        <a
          class="button--grey"
          href="https://github.com/nuxt/nuxt.js"
          target="_blank"
        >
          GitHub
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from "vue";
  import Logo from "~/components/Logo.vue";

  export default Vue.extend({
    components: {
      Logo,
    },
  });
</script>

<style lang="scss">
  .container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    margin: 0 auto;
    text-align: center;
  }

  .title {
    font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 100px;
    font-weight: 300;
    display: block;
    letter-spacing: 1px;
    color: #35495E;
  }

  .subtitle {
    font-size: 42px;
    font-weight: 300;
    padding-bottom: 15px;
    word-spacing: 5px;
    color: #526488;
  }

  .links {
    padding-top: 15px;
  }
</style>
