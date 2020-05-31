<template>
  <app-max-width-container :class="$style.container">
    <v-row>
      <v-col cols="12">
        <h1 :class="$style.header">
          <translated-text trans-key="press.header" />
        </h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-row>
          <v-col cols="12">
            <h2 :class="$style.subHeader">
              <translated-text trans-key="press.pressCorner.header" />
            </h2>
            <p>
              <translated-text trans-key="press.pressCorner.text" />
            </p>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <h2 :class="$style.subHeader" class="d-flex">
              <translated-text trans-key="press.pressKit.header" />
              <a :class="$style.pressKitDownload" href="#" target="_blank">
                <v-icon dense>mdi-download</v-icon>
                <translated-text trans-key="press.pressKit.download" />
              </a>
            </h2>
          </v-col>
        </v-row>
      </v-col>

      <v-col cols="12" md="4" offset-md="2">
        <v-row>
          <v-col cols="12">
            <h2 :class="$style.subHeader">
              <translated-text trans-key="press.contact" />
            </h2>
            <div>
              <h4 :class="$style.pressContactName">
                <translated-text trans-key="press.contact.name" />
              </h4>
              <h5 :class="$style.pressContactEmail">
                <translated-text trans-key="press.contact.email" />
              </h5>
            </div>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <h2 :class="$style.subHeader">
              <translated-text trans-key="press.mediaStuff.header" />
            </h2>
            <v-row
              v-for="release in pressReleases"
              :key="release.id"
              :class="$style.downloadLink"
            >
              <v-col class="d-flex" cols="1">
                <a
                  :href="release.url"
                  target="_blank"
                >
                  <v-icon>mdi-download</v-icon>
                </a>
              </v-col>
              <v-col cols="11">
                <a
                  :href="release.url"
                  target="_blank"
                >
                  {{ release.date }} {{ release.title }}
                </a>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-row>
          <v-col cols="12">
            <h2 :class="$style.subHeader">
              <translated-text trans-key="press.gallery.header" />
            </h2>
            <p>
              <translated-text trans-key="press.gallery.text" />
            </p>
          </v-col>
        </v-row>

        <v-row>
          <v-col
            v-for="image in galleryImages"
            :key="image.id"
            cols="6"
          >
            <v-img
              :class="$style.galleryImage"
              :lazy-src="thumbSrc(image.images)"
              :src="image.images.default"
              aspect-ratio="1.78"
              cover
              @click="openModal(image)"
            />
          </v-col>
        </v-row>

        <v-dialog
          v-model="modal"
          max-width="1000"
        >
          <v-card
            v-if="selectedImage"
          >
            <v-img
              :class="$style.modalImage"
              :lazy-src="thumbSrc(selectedImage.images)"
              :src="selectedImage.images.default"
              contain
            />

            <v-card-title>
              {{ selectedImage.title }}
            </v-card-title>

            <v-card-text>
              {{ selectedImage.description }}
            </v-card-text>

            <v-card-actions>
              <v-spacer />
              <v-btn
                color="green darken-1"
                text
                @click="modal = false"
              >
                <translated-text trans-key="press.gallery.modal.close" />
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<script>
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";
  import TranslatedText from "~/components/TranslatedText";
  import {
    formatDate,
  } from "~/helpers/date";
  import {
    generateMetadata,
  } from "~/helpers/head";

  export default {
    name: "PagePress",

    components: {
      AppMaxWidthContainer,
      TranslatedText,
    },

    async asyncData({ store }) {
      const parseDates =
        (list) =>
          list
            .map(
              ({ created_at, ...item }) =>
                ({
                  ...item,
                  date: formatDate(created_at),
                }),
            )
      ;

      return {
        pressReleases: await store.dispatch("pressRelease/fetchAllPressReleases").then(parseDates),
        galleryImages: await store.dispatch("gallery/fetchAllItems"),
      };
    },

    data: () => ({
      selectedImage: null,
      modal: false,
    }),

    methods: {
      thumbSrc(item) {
        const { default: _, ...imageObj } = item;
        const images =
          Object
            .entries(imageObj)
            .map(
              ([ k, v ]) =>
                [
                  Number(k.replace(/[^\d]/gi, "")),
                  v,
                ]
              ,
            )
        ;

        if (0 === images.length) {
          return "";
        }

        return (
          images
            .sort(([ a ], [ b ]) => a - b)
            .shift()
            .pop()
        );
      },

      openModal(image) {
        this.selectedImage = image;

        this.modal = true;
      },
    },

    head: () => ({
      title: "Press",
      meta: [
        ...generateMetadata({
          title: "Press",
        }),
      ],
    }),
  };
</script>

<style lang="scss" module>
  @import "../assets/styles/include/all";

  .container {

    .header {
      font-size: 250%;
      font-weight: bold;
      margin: 1em 0;
      text-align: center;
      color: $fer-dark-blue;
    }

    .subHeader {
      font-size: 162.5%;
      font-weight: bold;
      margin: .8em 0;
      color: $fer-dark-blue;
    }

    .pressKitDownload {
      font-size: 1rem;
      font-weight: 600;
      position: relative;
      top: .5em;
      margin-left: auto;
      text-decoration: none;
      color: inherit;

      > :global(*) {
        color: inherit;
      }
    }

    .pressContactName {
      font-size: 100%;
      font-weight: bold;
      margin-bottom: .8em;
      color: $fer-black;
    }

    .pressContactEmail {
      font-size: 100%;
      font-weight: normal;
      opacity: .7;
      color: $fer-black;
    }

    .downloadLink {

      :global(a) {
        font-size: 87.5%;
        font-weight: 600;
        align-self: center;
        text-decoration: none;
        color: $fer-dark-blue;
      }
    }

    .galleryImage {
      border-radius: 4px;
    }
  }
</style>
