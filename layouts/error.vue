<template>
  <div :class="$style.pageContainer" class="page-container">
    <v-row>
      <v-col :class="$style.textContainer" cols="12">
        <img
          :class="$style.image"
          :alt="errorMessage"
          src="../assets/images/404.png"
        >
        <h1 :class="$style.headline">
          <translated-text trans-key="page.error.notFound.title" />
        </h1>
        <p :class="$style.text">
          <translated-text trans-key="page.error.notFound.text" />
        </p>
        <v-btn
          :class="$style.button"
          :to="{ name: 'Index' }"
          color="primary"
          x-large
        >
          <translated-text trans-key="page.error.notFound.startPage" />
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script>
  import TranslatedText from "~/components/TranslatedText";

  export default {
    components: {
      TranslatedText,
    },

    layout: "empty",

    props: {
      error: {
        type: Object,
        default: null,
      },
    },

    computed: {
      errorMessage() {
        return `${ this.error.statusCode } - Stranica nije uhvaćena`;
      },
    },

    head() {
      return {
        title: this.errorMessage,
      };
    },
  };
</script>

<style lang="scss" module>
  @import "../assets/styles/include/all";

  .pageContainer {
    max-width: 680px;
    margin: 4em auto;
  }

  .image {
    width: 100%;
  }

  .textContainer {
    text-align: center;
  }

  .headline {
    font-size: 287.5%;
    font-weight: 700;
    line-height: 1.1em;
    margin: .7em 0;
    text-transform: uppercase;
    color: $fer-dark-blue;
  }

  .text {
    font-size: 125%;
  }

  .button {

    > :global(.v-btn__content) {
      color: $fer-black !important;
    }
  }
</style>
