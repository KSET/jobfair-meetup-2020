<template>
  <v-card
    :class="$style.newsCard"
    :to="{ name: 'PageBlogPost', params: { slug: news.slug } }"
    light
    tile
    v-bind="$attrs"
  >
    <v-img
      :lazy-src="news.images.thumb.url"
      :src="news.images.default.url"
      :srcset="srcSet(news.images)"
      aspect-ratio="1.875"
      cover
    />
    <div :class="$style.newsCardDate">
      {{ news.date }}
    </div>
    <v-card-title :class="$style.newsCardTitle">
      {{ news.title }}
    </v-card-title>
    <v-card-text :class="$style.newsCardText">
      {{ news.description }}
    </v-card-text>
  </v-card>
</template>

<script>
  import {
    getSrcSet,
  } from "~/helpers/image";
  import {
    processNewsItem,
  } from "~/helpers/news";

  export default {
    name: "AppNewsCard",

    inheritAttrs: false,

    props: {
      newsItem: {
        required: true,
        type: Object,
      },
    },

    computed: {
      news() {
        return processNewsItem(this.newsItem);
      },
    },

    methods: {
      srcSet: getSrcSet,
    },
  };
</script>

<style lang="scss" module>
  @import "../../assets/styles/include/all";

  .newsCard {
    height: 100%;

    .newsCardDate {
      font-size: 87.5%;
      padding: 1rem 1rem 0;
      opacity: .5;
    }

    .newsCardTitle {
      font-size: 125%;
      font-weight: bold;
      padding: .3em 1rem;
      transition-timing-function: $transition-timing-function;
      transition-duration: 150ms;
      transition-property: opacity;
      word-break: break-word;
      color: $fer-dark-blue;
      will-change: opacity;
    }

    .newsCardText {
      font-size: 100%;
    }

    &:hover {

      .newsCardTitle {
        opacity: .7;
      }
    }
  }
</style>
