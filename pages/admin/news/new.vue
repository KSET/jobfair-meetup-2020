<template>
  <app-max-width-container :class="$style.container">
    <v-row :class="$style.imageRow">
      <v-col cols="12">
        <v-img
          :class="$style.headerImage"
          :lazy-src="rawNews.images && rawNews.images.thumb ? rawNews.images.thumb.url : null"
          :src="imagePreview || rawNews.images && rawNews.images.default.url || require('@/assets/images/404.png')"
          aspect-ratio="2.4"
          position="bottom center"
        >
          <div
            :class="$style.headerImageInputContainer"
            class="align-self-center d-flex"
          >
            <v-file-input
              :accept="headerImage.allowedMimeTypes"
              :class="$style.headerImageInput"
              :clearable="!loading"
              :error-count="Infinity"
              :loading="loading"
              :prepend-icon="null"
              :rules="headerImageRules"
              :value="headerImage.file"
              dense
              full-width
              label="Header slika"
              show-size
              solo
              @change="handleHeaderImageChange"
            />
          </div>
          <div
            v-if="headerImage.file && !headerImage.error"
            :class="$style.headerImageUploadContainer"
            @click.prevent="handleHeaderImageUpload"
          >
            <v-btn
              :loading="loading"
            >
              Upload
            </v-btn>
          </div>
        </v-img>
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
                  :error="errors.date"
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

            <v-sheet
              v-if="errors.title"
              :class="$style.errorBar"
              color="error"
              v-text="errors.title"
            />
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
            <v-sheet
              v-if="errors.description"
              :class="$style.errorBar"
              color="error"
              v-text="errors.description"
            />
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
          <v-sheet
            v-if="errors.content"
            :class="$style.errorBar"
            class="col col-12"
            color="error"
            v-text="errors.content"
          />
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

        <v-row>
          <v-col class="text-right">
            <v-btn
              :loading="loading"
              color="warning"
              x-large
              :href="$router.resolve({ name: 'PageAdminNewsList' }).href"
            >
              Cancel
            </v-btn>
            <v-btn
              :disabled="!rawNews.images"
              :loading="loading"
              color="success"
              x-large
              @click="submitForm"
            >
              Save
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-snackbar
      v-model="error"
      bottom
      color="error"
      light
      multi-line
      right
    >
      {{ errorText }}
      <v-btn
        color="#fff"
        text
        @click="error = false"
      >
        Close
      </v-btn>
    </v-snackbar>
  </app-max-width-container>
</template>

<script>
  import {
    mapActions,
  } from "vuex";
  import {
    processNewsItem,
  } from "~/helpers/news";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";

  export default {
    name: "PageAdminNewsCreate",

    components: {
      AppMaxWidthContainer,
    },

    data() {
      const newsItem = {
        title: "",
        description: "",
        content: "",
        date: (new Date()).toISOString(),
        images: null,
      };

      return {
        rawNews: {
          ...newsItem,
        },
        editorLoading: true,
        datePickerOpen: false,
        editedDate: newsItem.date,
        loading: false,
        error: false,
        errorText: "",
        errors: {},

        headerImage: {
          newId: null,
          error: false,
          file: null,
          allowedMimeTypes: [
            "image/png",
            "image/jpeg",
          ],
        },
      };
    },

    computed: {
      news() {
        return processNewsItem(this.rawNews);
      },

      imagePreview() {
        if (!this.headerImage.file || this.headerImage.error) {
          return "";
        }

        return URL.createObjectURL(this.headerImage.file);
      },

      headerImageRules() {
        const validMimeType = (file) => {
          if (!file) {
            return true;
          }

          const allowedTypes = this.headerImage.allowedMimeTypes;

          if (false === allowedTypes.includes(file.type)) {
            const types =
              allowedTypes
                .map((e) => e.split("/").pop())
                .map((e) => `.${ e }`).join(", ")
            ;

            return `Datoteka mora biti slika (${ types })`;
          }

          return true;
        };

        const smallerThan5Mb = (file) => {
          if (!file) {
            return true;
          }

          if (1000 * 1000 * 5 < file.size) {
            return "Datoteka mora biti manja od 5MB";
          }

          return true;
        };

        return [
          smallerThan5Mb,
          validMimeType,
        ];
      },

      saveHandler() {
        if (this.rawNews.id) {
          return this.doNewsUpdate;
        } else {
          return this.doNewsCreate;
        }
      },
    },

    watch: {
      editedDate(a) {
        this.$set(this.rawNews, "date", new Date(a));
      },
    },

    methods: {
      ...mapActions({
        doNewsUpdate: "news/updateNewsItem",
        doNewsCreate: "news/createNewsItem",
        doUploadImage: "image/uploadImage",
        fetchImageInfo: "image/fetchImageVariationInfo",
      }),

      handleEdit(prop, event) {
        event.preventDefault();
        event.stopPropagation();

        this.$set(this.rawNews, prop, event.target.textContent);
      },

      handleHeaderImageChange(file) {
        this.headerImage.error = false;

        if (!file) {
          this.headerImage.file = null;
          return;
        }

        for (const validation of this.headerImageRules) {
          if (true !== validation(file)) {
            return;
          }
        }

        this.headerImage.file = file;
      },

      async handleHeaderImageUpload() {
        const err = (msg) => {
          this.error = true;
          this.errorText = msg;
          this.loading = false;
        };

        this.loading = true;
        const {
          error,
          message,
          images,
        } = await this.doUploadImage(this.headerImage.file);

        if (error) {
          return err(message);
        }

        const imageInfo = await this.fetchImageInfo(images.default.replace(/^\/api/i, ""));

        if (imageInfo.error) {
          return err("Something went wrong. Please try again.");
        }

        const parsedImages = Object.fromEntries(
          Object
            .entries(images)
            .map(([ width, url ]) => [ width, { width, url } ])
          ,
        );

        this.headerImage.file = null;
        this.headerImage.newId = imageInfo.data.image_id;
        this.$set(this.rawNews, "images", parsedImages);

        this.loading = false;
      },

      async submitForm() {
        const { slug, date, content, title, description } = this.rawNews;
        const news = {
          date,
          content,
          title,
          description,
          imageId: this.headerImage.newId,
        };

        this.loading = true;
        const res = await this.saveHandler({
          slug,
          news,
        });
        this.loading = false;

        this.error = res.error;

        if (this.error) {
          if (res.errorData.global) {
            this.errorText = res.errorData.global;
            return;
          }

          this.errorText = "Provjerite greške";
          this.$set(this, "errors", res.errorData);
          this.$nextTick(() => this.$vuetify.goTo(`.${ this.$style.errorBar }`, {
            duration: 1000,
            offset: 20,
            easing: "easeInOutCubic",
          }));
        } else {
          await this.$router.push({ name: "PageAdminNewsList" });
        }
      },
    },
  };
</script>

<style lang="scss" module>
  @import "../../../assets/styles/include/all";

  .container {

    .headerImage {

      :global .v-responsive__content {
        display: flex;
      }

      .headerImageUploadContainer {
        position: absolute;
        right: 1em;
        bottom: 1em;
      }

      .headerImageInputContainer {
        align-items: center;
        justify-content: center;
        width: 50%;
        margin: 0 auto;

        .headerImageInput {

          :global .v-messages.error--text {
            padding: .6em;
            border-top: 1px solid transparentize($fer-black, .85);
            border-bottom-right-radius: 4px;
            border-bottom-left-radius: 4px;
            background-color: $fer-white;
          }

          :global .v-text-field__details {
            margin-top: -4px;
          }

          :global .v-input__slot {
            cursor: pointer;
          }
        }
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

    .editableArea,
    :global(*[contenteditable="true"]) {
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

    :global(.row) .errorBar {
      font-weight: bold;
      padding: 8px;
      color: $fer-white;
      border-bottom-right-radius: 0;
      border-bottom-left-radius: 0;
      text-shadow: 1px 1px rgba(0, 0, 0, .3);

      & + :global(*) {
        box-sizing: border-box;
        border-top: none;
        border-top-left-radius: 1px;
        border-top-right-radius: 1px;
      }
    }
  }
</style>
