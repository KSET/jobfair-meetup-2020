<template>
  <h1>NEWS: {{ news.title }}</h1>
</template>

<script>
  import {
    mapGetters,
  } from "vuex";

  export default {
    name: "Blog:Post",

    computed: {
      ...mapGetters({
        news: "news/newsItem",
      }),
    },

    validate({ params, store }) {
      return store.dispatch("news/fetchNewsItem", params.slug);
    },
  };
</script>
