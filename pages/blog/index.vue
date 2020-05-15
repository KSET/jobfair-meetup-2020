<template>
  <app-max-width-container :class="$style.pageContainer">
    <v-row>
      <v-col cols="12">
        <v-row>
          <v-col>
            <h1 :class="$style.header">
              Blog
            </h1>
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <v-card
              :to="{ name: 'Blog:Post', params: { slug: headNews.slug } }"

              elevation="0"
              light
              tile
            >
              <div :class="$style.headNews">
                <div>
                  <v-img
                    :lazy-src="headNews.imageThumbnail"
                    :src="headNews.image"
                    contain
                  />
                </div>
                <div :class="$style.headNewsContent">
                  <v-card-subtitle :class="$style.headNewsDate" v-text="headNews.date" />
                  <v-card-title :class="$style.headNewsTitle" v-text="headNews.title" />
                  <v-card-text :class="$style.headNewsText" v-text="headNews.text" />
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <v-col
            v-for="news in restNews"
            :key="news.id"
            :cols="12"
            :md="4"
          >
            <app-news-card
              :elevation="0"
              :news-item="news"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<script>
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";
  import AppNewsCard from "~/components/news/NewsCard";
  import {
    ensureArray,
  } from "~/helpers/data";
  import {
    processNewsItem,
  } from "~/helpers/news";

  export default {
    name: "Blog:Home",
    components: { AppMaxWidthContainer, AppNewsCard },
    async asyncData({ store }) {
      const news = await store.dispatch("news/fetchNews").then(ensureArray);

      return {
        news,
      };
    },

    computed: {
      headNews() {
        return processNewsItem(this.news.slice(0, 1).pop());
      },

      restNews() {
        return this.news.slice(1);
      },
    },

    head: () => ({
      title: "Blog - Home",
      page: {
        description: "JobFair Meetup blog",
      },
    }),
  };
</script>

<style lang="scss" module>
  @import "../../assets/styles/include/all";

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
  }
</style>
