<template>
  <app-max-width-container :class="$style.container">
    <v-row :class="$style.imageRow">
      <v-col cols="12">
        <v-img
          :lazy-src="news.imageThumbnail"
          :src="news.image"
          aspect-ratio="2.4"
          position="bottom center"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="7" offset-md="2">
        <v-row>
          <v-col cols="12">
            <v-menu
              ref="menu"
              v-model="datePickerOpen"
              :close-on-content-click="false"
              light
              min-width="290px"
              offset-y
              transition="scale-transition"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  :value="news.date"
                  label="Datum"
                  light
                  readonly
                  v-on="on"
                />
              </template>
              <v-date-picker
                v-model="editedDate"
                light
                no-title
                @input="datePickerOpen = false"
              />
            </v-menu>

            <h1
              v-once
              :class="[ $style.header ]"
              contenteditable="true"
              data-placeholder="Naslov"
              @input="handleEdit('title', $event)"
              v-text="rawNews.title"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <p
              v-once
              :class="[ $style.description ]"
              contenteditable="true"
              data-placeholder="Opis"
              @input="handleEdit('description', $event)"
              v-text="rawNews.description"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col
            :class="{
              [$style.editableArea]: true,
              [$style.editorContainerLoading]: editorLoading,
            }"
            cols="12"
          >
            <client-only>
              <rich-editor
                v-model="rawNews.content"
                :class="$style.editor"
                @ready="editorLoading = false"
              />
            </client-only>
            <div
              v-if="editorLoading"
              :class="$style.editor"
              v-html="news.content"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<script>
  import {
    processNewsItem,
  } from "~/helpers/news";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";

  export default {
    name: "PageBlogPostEdit",

    middleware: "authenticated",

    components: {
      AppMaxWidthContainer,
    },

    data() {
      const newsItem = this.$store.getters["news/newsItem"];

      return {
        rawNews: {
          ...newsItem,
        },
        editorLoading: true,
        datePickerOpen: false,
        editedDate: newsItem.date,
      };
    },

    computed: {
      news() {
        return processNewsItem(this.rawNews);
      },
    },

    watch: {
      editedDate(a) {
        this.$set(this.rawNews, "date", new Date(a));
      },
    },

    methods: {
      handleEdit(prop, event) {
        event.preventDefault();
        event.stopPropagation();

        this.$set(this.rawNews, prop, event.target.textContent);
      },
    },

    validate({ params, store }) {
      return store.dispatch("news/fetchNewsItem", params.slug);
    },
  };
</script>

<style lang="scss" module>
  @import "../../../assets/styles/include/all";

  .container {

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

    .editableArea,
    :global(*[contenteditable]) {
      position: relative;
      overflow: hidden;
      min-height: 1em;
      border: 1px dashed $fer-dark-blue;
      border-radius: 4px;

      &:empty,
      *[data-empty] {

        &::before {
          content: attr(data-placeholder);
          opacity: .5;
        }
      }
    }

    .editorContainerLoading {
      cursor: default;
      border-color: $fer-error;

      * {
        cursor: default !important;
        user-select: none;
        pointer-events: none;
      }

      &::before {
        font-size: 125%;
        font-weight: bold;
        position: absolute;
        top: -1px;
        right: -1px;
        padding: 1em 1.5em;
        content: "Loading...";
        color: $fer-black;
        border: 1px dashed $fer-error;
        border-bottom-left-radius: 4px;
        background-color: $fer-yellow;
      }
    }

    .editor {
      @extend %blog-styles;

      padding: 0;
      border: none !important;
      box-shadow: none !important;
    }
  }
</style>
