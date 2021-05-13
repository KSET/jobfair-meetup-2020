<template>
  <app-max-width-container>
    <v-row>
      <v-col cols="12">
        <h1
          :class="$style.header"
          class="text-center my-12"
        >
          <translated-text trans-key="live.header" />
        </h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <div :class="$style.wrapper">
          <iframe
            :class="$style.iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            frameborder="0"
            height="100%"
            :src="`https://www.youtube.com/embed/${youtubeId}`"
            title="YouTube video player"
            width="100%"
          />
        </div>
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<router>
name: PageLive
</router>

<script>
  import {
    mapGetters,
  } from "vuex";
  import AppMaxWidthContainer from "../components/AppMaxWidthContainer";
  import TranslatedText from "../components/TranslatedText";

  export default {
    components: {
      TranslatedText,
      AppMaxWidthContainer,
    },

    async validate({ store, redirect }) {
      const isLive = await store.getters["external/live/isLive"];

      if (isLive) {
        return true;
      }

      return redirect({ name: "Index" });
    },

    computed: {
      ...mapGetters("external/live", [
        "youtubeId",
      ]),
    },
  };
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  .header {
    font-size: 250%;
    font-weight: bold;
    text-align: center;
    text-transform: uppercase;
    color: $fer-dark-blue;
  }

  .wrapper {
    position: relative;
    padding-top: 56.25%;

    .iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }
</style>
