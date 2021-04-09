<template>
  <app-max-width-container :class="$style.pageContainer">
    <v-row>
      <v-col cols="12">
        <v-row>
          <v-col>
            <h1 :class="$style.header">
              <translated-text trans-key="blog.header" />
            </h1>
          </v-col>
        </v-row>

        <v-row
          v-if="headNews"
        >
          <v-col>
            <v-card
              :to="{ name: 'PageBlogPost', params: { slug: headNews.slug } }"

              elevation="0"
              light
              tile
            >
              <div :class="$style.headNews">
                <div>
                  <v-img
                    :lazy-src="headNews.images.thumb.url"
                    :src="headNews.images.default.url"
                    :srcset="srcSet(headNews.images)"
                    aspect-ratio="2.2"
                    cover
                  />
                </div>
                <div :class="$style.headNewsContent">
                  <v-card-subtitle :class="$style.headNewsDate" v-text="headNews.date" />
                  <v-card-title :class="$style.headNewsTitle" v-text="headNews.title" />
                  <v-card-text :class="$style.headNewsText" v-text="headNews.description" />
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <v-row
          v-if="restNews.length > 0"
          :class="$style.restNews"
        >
          <v-col
            v-for="news in restNews"
            :key="news.id"
            :cols="12"
            :md="4"
          >
            <app-news-card
              :class="$style.restNewsCard"
              :elevation="0"
              :news-item="news"
            />
          </v-col>
        </v-row>

        <v-row v-if="!headNews">
          <v-col>
            <h1 class="font-weight-light">
              <translated-text trans-key="blog.noNews" />
            </h1>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<router>
name: PageBlogHome
</router>

<script>
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";
  import AppNewsCard from "~/components/news/NewsCard";
  import TranslatedText from "~/components/TranslatedText";
  import {
    ensureArray,
  } from "~/helpers/data";
  import {
    generateMetadata,
  } from "~/helpers/head";
  import {
    getSrcSet,
  } from "~/helpers/image";
  import {
    processNewsItem,
  } from "~/helpers/news";

  export default {
    name: "PageBlogHome",

    components: { TranslatedText, AppMaxWidthContainer, AppNewsCard },

    async asyncData({ store }) {
      const news = await store.dispatch("news/fetchNews").then(ensureArray);

      return {
        news,
      };
    },

    computed: {
      headNews() {
        const headNews = this.news.slice(0, 1).pop();

        if (!headNews) {
          return null;
        }

        return processNewsItem(headNews);
      },

      restNews() {
        return this.news.slice(1);
      },
    },

    methods: {
      srcSet: getSrcSet,
    },

    head: () => ({
      title: "Blog - Home",
      meta: [
        ...generateMetadata({
          title: "Blog - Home",
          description: "Job Fair Meetup Blog",
        }),
      ],
    }),
  };
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  .pageContainer {

    .header {
      font-size: 250%;
      font-weight: 800;
      margin: 1em auto;
      text-align: center;
      color: $fer-dark-blue;
    }

    .headNews {
      display: grid;
      grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
      grid-gap: 12px;

      @include media(md) {
        grid-template-columns: minmax(0, 1fr);
      }

      .headNewsContent {
        display: flex;
        flex-direction: column;
        justify-content: center;

        .headNewsDate {
          padding-bottom: 0;
          opacity: .5;
          color: $fer-black;
        }

        .headNewsTitle {
          font-size: 137.5%;
          font-weight: bold;
          word-break: break-word;
          color: $fer-dark-blue;
        }

        .headNewsText {
          font-size: 100%;
          opacity: .7;
          color: $fer-black;
        }
      }
    }

    .restNews {

      .restNewsCard {
        height: 100%;
      }
    }
  }
</style>
