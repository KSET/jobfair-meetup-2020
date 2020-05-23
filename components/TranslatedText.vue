<template>
  <span
    v-translation="transKey"
    :class="{
      [$style.translatedText]: true,
      [$style.editing]: isEditable,
    }"
    :contenteditable="isEditable"
    @blur="handleBlur"
    @click="handleClick"
    @input="text = $event.target.innerHTML"
  />
</template>

<script>
  import {
    mapActions,
    mapGetters,
  } from "vuex";

  export default {
    name: "TranslatedText",

    props: {
      transKey: {
        required: true,
        type: String,
      },
    },

    data: () => ({
      text: null,
    }),

    computed: {
      ...mapGetters({
        isEditable: "translations/isEditable",
      }),

      cleanText() {
        return this.cleanUpText(this.text);
      },

      translation() {
        if (!this.$el) {
          return this.cleanText;
        }

        return this.cleanText || this.cleanUpText(this.$el.innerHTML);
      },
    },

    watch: {
      text: {
        handler() {
          this.$emit("input", this.translation);
        },

        immediate: true,
      },
    },

    mounted() {
      this.text = this.translation;
    },

    methods: {
      ...mapActions({
        updateTranslation: "translations/updateTranslation",
      }),

      cleanUpText(text) {
        if (!text) {
          return "";
        }

        const brKey = `|${ Math.random().toString(36).substr(3) }|`;
        const html = String(text).trim().replace(/<br>/gi, `${ brKey }br${ brKey }`);
        const div = document.createElement("div");
        div.innerHTML = html;

        const eBrKey = brKey.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

        return div.textContent.replace(RegExp(`${ eBrKey }br${ eBrKey }`, "gi"), "<br>");
      },

      async handleBlur() {
        const key = this.transKey;
        const value = this.cleanText;

        if (!value) {
          return;
        }

        const { error, errorData } = await this.updateTranslation({
          key,
          value,
        });

        if (error) {
          const message =
            errorData
              ? errorData.join("\n")
              : "Something went wrong"
          ;

          return alert(message);
        }

        this.text = null;
      },

      handleClick(event) {
        if (this.isEditable) {
          event.preventDefault();
          event.stopPropagation();
          return false;
        }

        return true;
      },
    },
  };
</script>

<style lang="scss" module>
  @import "../assets/styles/include/all";

  .translatedText {
    max-width: 100%;
    word-break: break-word;
  }

  .editing {
    position: relative !important;
    display: inline-flex;
    overflow: hidden;
    box-sizing: border-box;
    min-height: 1em !important;
    border: 1px dashed $fer-dark-blue !important;
    border-radius: 4px !important;
    box-shadow: 0 0 3px 1px $fer-black, 0 0 1px 1px $fer-white !important;

    &:empty,
    *[data-empty] {

      &::after {
        content: attr(data-placeholder);
        opacity: .5;
      }
    }
  }
</style>
