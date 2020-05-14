<template>
  <div :class="$style.pageContainer" class="page-container">
    <v-row>
      <v-col :class="$style.textContainer" cols="12">
        <img
          :class="$style.image"
          :alt="errorMessage"
          src="../assets/images/404.svg?inline"
        >
        <h1 :class="$style.headline">
          Stranica nije uhvaćena
        </h1>
        <p :class="$style.text">
          Prestani tražiti nepostojeće stranice i ulovi
          <br>
          karijeru na JobFair MeetUp-u!
        </p>
        <v-btn
          :class="$style.button"
          :to="{ name: 'Index' }"
          color="primary"
          x-large
        >
          Početna
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script>
  export default {
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
