<template>
  <v-card
    :class="$style.newsCard"
    :to="{ name: 'Blog:Post', params: { slug: news.slug } }"
    light
    tile
    v-bind="$attrs"
  >
    <v-img
      :src="news.image"
      :lazy-src="news.imagePlaceholder"
      aspect-ratio="1.875"
    />
    <div :class="$style.newsCardDate">
      {{ news.date }}
    </div>
    <v-card-title :class="$style.newsCardTitle">
      {{ news.title }}
    </v-card-title>
    <v-card-text :class="$style.newsCardText">
      {{ news.text }}
    </v-card-text>
  </v-card>
</template>

<script>
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
  };
</script>

<style lang="scss" module>
  @import "../../assets/styles/include/all";

  .newsCard {

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
