<template>
  <v-card
    :class="$style.kitContainer"
    :href="fileUrl"
    flat
    target="_blank"
  >
    <div
      :class="$style.imageContainer"
    >
      <v-img
        :class="$style.image"
        :lazy-src="lazyImageUrl || imageUrl"
        :src="imageUrl"
        aspect-ratio="1.95"
        contain
      />

      <v-img
        :class="$style.downloadIcon"
        :src="downloadIconSrc"
        class="no-select"
        contain
        height="16px"
        width="16px"
      />
    </div>

    <v-card-subtitle
      :class="$style.kitText"
      class="text-center no-select"
      v-text="title"
    />
  </v-card>
</template>

<script>
  import downloadIconSrc from "@/assets/images/icons/icon-download.svg?inline";

  export default {
    name: "JfPressKit",

    props: {
      title: {
        required: true,
        type: String,
      },

      fileUrl: {
        required: true,
        type: String,
      },

      imageUrl: {
        required: true,
        type: String,
      },

      lazyImageUrl: {
        required: false,
        type: String,
        default: () => undefined,
      },
    },

    computed: {
      downloadIconSrc() {
        return downloadIconSrc;
      },
    },
  };
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  .kitContainer {
    padding: .5em;

    &,
    &::before {
      border-radius: 4px;
    }

    .imageContainer {
      position: relative;
      transition-timing-function: $transition-timing-function;
      transition-duration: 250ms;
      transition-property: border-color;
      border: 1px solid transparentize($fer-black, .8);
      border-radius: 4px;
      will-change: border-color;

      .downloadIcon {
        position: absolute;
        top: 1em;
        right: 1em;
        transition-timing-function: $transition-bounce-function;
        transition-duration: 350ms;
        transition-property: opacity, transform;
        transform: translateY(-10px);
        opacity: 0;
        will-change: opacity, transform;
      }
    }

    &:hover {

      .imageContainer {
        border-color: transparentize($fer-black, .6);

        .downloadIcon {
          transform: translateY(0);
          opacity: .9;
        }
      }
    }

    .kitText {
      font-size: 14px;
      padding-top: 6px;
      padding-bottom: 0;
      color: transparentize($fer-black, .2) !important;
    }
  }
</style>
