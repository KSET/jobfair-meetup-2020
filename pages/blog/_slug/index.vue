<template>
  <app-max-width-container :class="$style.container">
    <v-row :class="$style.imageRow">
      <v-col cols="12">
        <v-img
          :lazy-src="news.images.thumb.url"
          :src="news.images.default.url"
          aspect-ratio="2.4"
          contain
        />
      </v-col>
    </v-row>

    <v-row :class="$style.contentContainer">
      <v-col cols="12">
        <v-row v-if="$store.getters['user/getUser']" :class="$style.adminActionContainer">
          <v-col cols="12">
            <v-btn
              :to="{ name: 'PageAdminNewsEdit', params: { slug: $route.params.slug } }"
              color="primary"
              outlined
            >
              Edit
            </v-btn>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="7" offset-md="2">
            <v-row>
              <v-col cols="12">
                <h3 :class="$style.date">
                  {{ news.date }}
                </h3>

                <h1 :class="$style.header">
                  {{ news.title }}
                </h1>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <p :class="$style.description">
                  {{ news.description }}
                </p>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <div
                  :class="$style.content"
                  v-html="news.content"
                />
              </v-col>
            </v-row>
          </v-col>

          <v-col :class="$style.socialLinkContainer" class="mt-md-12" cols="12" md="1" offset-md="1">
            <a
              v-for="social in socials"
              :key="social.src"

              v-ripple
              v-bind="social.attr || {}"
              :class="$style.socialLink"
              :href="social.href"
              rel="noopener noreferrer"
              target="_blank"
            >
              <v-img
                :src="social.src"

                aspect-ratio="1"
                contain
              />
            </a>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-divider class="my-12" />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <h1 :class="$style.header" class="text-center">
              Zadnje objave
            </h1>
          </v-col>
        </v-row>

        <v-row class="mb-12">
          <v-col
            v-for="newsItem of recentNews"
            :key="newsItem.id"
            cols="12"
            md="4"
          >
            <app-news-card
              :elevation="0"
              :news-item="newsItem"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<router>
name: PageBlogPost
</router>

<script>
  import {
    mapGetters,
  } from "vuex";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";
  import AppNewsCard from "~/components/news/NewsCard";
  import {
    ensureArray,
    limitLength,
  } from "~/helpers/data";
  import {
    generateMetadata,
  } from "~/helpers/head";
  import {
    processNewsItem,
  } from "~/helpers/news";
  import {
    fixedEncodeURIComponent,
  } from "~/helpers/url";

  export default {
    name: "PageBlogPost",

    components: {
      AppNewsCard,
      AppMaxWidthContainer,
    },

    async asyncData({ store }) {
      return {
        recentNews: await store.dispatch("news/fetchNews").then(ensureArray).then(limitLength(3)),
      };
    },

    computed: {
      ...mapGetters({
        rawNews: "news/newsItem",
      }),

      news() {
        return processNewsItem(this.rawNews);
      },

      socials() {
        const url = fixedEncodeURIComponent(`${ process.env.BASE_URL }${ this.$route.path }`);
        const text = fixedEncodeURIComponent(this.news.title);

        return [
          {
            src: require("@/assets/images/icons/icon-fb.png"),
            href: `https://www.facebook.com/sharer/sharer.php?u=${ url }`,
          },
          {
            src: require("@/assets/images/icons/icon-wp.png"),
            href: `https://api.whatsapp.com/send?text=${ text }%0A${ url }`,
            attr: {
              "data-action": "share/whatsapp/share",
            },
          },
          {
            src: require("@/assets/images/icons/icon-tg.png"),
            href: `https://t.me/share/url?url=${ url }&text=${ text }`,
          },
          {
            src: require("@/assets/images/icons/icon-tw.png"),
            href: `https://twitter.com/intent/tweet?url=${ url }&text=${ text }`,
          },
          {
            src: require("@/assets/images/icons/icon-ln.png"),
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${ url }`,
          },
        ];
      },
    },

    validate({ params, store }) {
      return store.dispatch("news/fetchNewsItem", { slug: params.slug, force: true });
    },

    head() {
      const { title, description, images } = this.news || {};

      const image =
        images
          ? images.default.url
          : "";

      return {
        title,
        meta: [
          ...generateMetadata({
            title,
            image,
            description,
          }),
        ],
      };
    },
  };
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  .container {

    .adminActionContainer {
      text-align: right;

      @include media(md) {
        margin-top: 1em;
      }
    }

    .contentContainer {
      margin: 0 3em;
    }

    .date {
      font-size: 87.5%;
      font-weight: normal;
      opacity: .5;
      color: $fer-black;

      @include media(md) {
        margin-bottom: .2em;
        opacity: 1;
      }
    }

    .header {
      font-size: 250%;
      color: $fer-dark-blue;

      @include media(md) {
        font-size: 162.5%;
        margin-bottom: .69em;
      }
    }

    .description {
      font-size: 125%;
      font-weight: 600;
      color: $fer-black;

      @include media(md) {
        font-size: 112.5%;
      }
    }

    .socialLinkContainer {
      display: flex;
      flex-direction: column;

      @include media(md) {
        flex-direction: row;
        margin-bottom: -1.8em;
      }

      .socialLink {
        display: block;
        width: 24px;
        margin-bottom: 1em;
        margin-left: auto;
        transition-timing-function: $transition-timing-function;
        transition-duration: 200ms;
        transition-property: opacity;
        border-radius: 4px;

        &:last-child {
          margin-bottom: 0;
        }

        &:hover {
          opacity: .5;
        }

        @include media(md) {
          margin: auto;
        }
      }
    }

    .content {
      @extend %blog-styles;
    }

    @include media(md) {

      .imageRow {
        margin: 0;
      }

      :global(.col.col-12) {
        max-width: 100%;
        padding: 0;
      }

    }
  }
</style>
