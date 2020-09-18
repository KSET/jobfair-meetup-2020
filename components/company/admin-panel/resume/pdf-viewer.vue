<template>
  <client-only>
    <div :class="$style.masterContainer">
      <div
        :class="{
          [$style.container]: true,
          [$style.containerLoading]: isLoading,
        }"

        @wheel="handleScroll"
      >
        <div
          v-if="isLoading"
          style="text-align: center;"
        >
          <h1 style="white-space: pre;" v-text="loadingMessage" />
          <v-progress-circular
            v-if="loading.state !== 'error'"
            :color="loading.state"
            :size="50"
            indeterminate
          />
        </div>

        <div
          :class="{
            [$style.pages]: true,
            [$style.hidePages]: isLoading,
          }"
          :style="containerStyle"
        >
          <pdf-renderer
            v-for="i in numPages"
            :key="i"
            :class="$style.page"
            :page="i"
            :src="url"

            @loaded="setPageLoaded(i)"
          />
        </div>

        <v-hover
          v-if="!isLoading"
          v-slot:default="{ hover }"
          :value="forceHover"
          :class="$style.buttonHoverContainer"
          close-delay="2000"
        >
          <div
            :class="{
              [$style.buttonContainer]: true,
              [$style.buttonsShown]: hover,
            }"
          >
            <v-btn fab small class="mb-2" @click="zoomFull">
              <v-icon v-text="'mdi-fullscreen-exit'" />
            </v-btn>

            <v-btn fab small @click="zoomIncrement">
              <v-icon v-text="'mdi-plus'" />
            </v-btn>

            <v-btn fab small @click="zoomDecrement">
              <v-icon v-text="'mdi-minus'" />
            </v-btn>
          </div>
        </v-hover>
      </div>
    </div>
  </client-only>
</template>

<script>
  const zoomLevels = [ 25, 50, 75, 90, 100, 110, 125, 150, 200, 250, 300, 400, 500, 600 ];

  export default {
    name: "PdfViewer",

    props: {
      url: {
        type: String,
        required: true,
      },
    },

    data: () => ({
      loading: {
        state: "secondary",
        pages: [
          true,
        ],
        forceHover: true,
      },

      zoomLevels,

      zoom: zoomLevels.findIndex((v) => 100 === v),

      numPages: 0,
    }),

    computed: {
      isLoading() {
        return 0 < this.pagesLoadingCount;
      },

      loadingMessage() {
        switch (this.loading.state) {
          case "secondary":
            return "Loading PDF...";
          case "primary":
            return `Rendering PDF (${ this.numPages - this.pagesLoadingCount + 1 }/${ this.numPages })...`;
          case "error":
            return "Something went wrong...\nTry reloading the page.";
          default:
            return "Loading...";
        }
      },

      pagesLoadingCount() {
        return this.loading.pages.reduce((acc, a) => acc + a, 0);
      },

      containerStyle() {
        return `width:${ zoomLevels[this.zoom] }%;`;
      },
    },

    watch: {
      url: {
        handler() {
          this.loadPdf();
        },
      },
    },

    mounted() {
      this.loadPdf();
    },

    methods: {
      loadPdf() {
        const { default: pdf } = require("vue-pdf");
        const task = pdf.createLoadingTask(this.url);

        task.promise.then((pdf) => {
          this.numPages = pdf.numPages;

          this.loading.state = "primary";
          this.$set(this.loading, "pages", new Array(this.numPages).fill(true));

          this.forceHover = true;
          setTimeout(() => {
            this.forceHover = false;
          }, 2000);
        }).catch((error) => {
          this.loading.state = "error";
          console.error(error);
        });
      },

      setPageLoaded(index) {
        this.$set(this.loading.pages, index - 1, false);
      },

      zoomIncrement() {
        if (this.zoom < zoomLevels.length) {
          this.zoom++;
        }
      },

      zoomDecrement() {
        if (0 < this.zoom) {
          this.zoom--;
        }
      },

      zoomFull() {
        this.zoom = zoomLevels.findIndex((val) => 100 === val);
      },

      handleScroll(event) {
        if (!event.ctrlKey) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        if (0 > event.deltaY) {
          this.zoomIncrement();
        } else {
          this.zoomDecrement();
        }
      },
    },
  };
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  .masterContainer {
    overflow: hidden;
    transform: translateZ(0);
  }

  .container {
    $padding: 2em;

    position: relative;
    display: flex;
    overflow: auto;
    flex-direction: column;
    width: 100%;
    height: 100%;
    margin: 0 auto;
    padding: $padding;
    background-color: $fer-gray;
    box-shadow: inset 0 4px 4px rgba(0, 0, 0, .25);

    @include media(sm) {
      padding: $padding / 2;
    }

    &.containerLoading {
      align-items: center;
      justify-content: center;
    }

    .pages {
      $gap: .75 * $padding;

      display: grid;
      width: 100%;
      height: 100%;
      margin: 0 auto;
      grid-template-columns: 1fr;
      grid-row-gap: $gap;

      &.hidePages {
        display: none;
      }

      .page {
        box-shadow: 0 2px 4px -1px rgba(0, 0, 0, .2), 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 10px 0 rgba(0, 0, 0, .12);

        &:last-child {
          margin-bottom: $padding;

          @include media(sm) {
            margin-bottom: $padding / 2;
          }
        }
      }
    }

    .buttonHoverContainer,
    .buttonContainer {
      position: fixed;
      z-index: 9999;
      right: 0;
      bottom: 0;
    }

    .buttonContainer {
      display: grid;
      padding: #{1.5 * $padding} #{$padding} #{$padding} #{1.5 * $padding};
      transition-timing-function: $transition-bounce-function;
      transition-duration: 500ms;
      transition-property: opacity;
      opacity: 0;
      grid-template-columns: 1fr;
      grid-row-gap: 1em;

      &.buttonsShown {
        opacity: 1;
      }
    }
  }
</style>
