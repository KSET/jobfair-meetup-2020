<template>
  <v-row :class="$style.subsection" :data-name="name">
    <v-col
      class="pb-0"
      cols="12"
    >
      <h3
        :class="$style.header"
      >
        <translated-text
          :trans-key="`studentResume.section.${name}.header`"
        />
      </h3>
    </v-col>

    <v-col class="pt-0" cols="12" :class="$style.items">
      <slot />
    </v-col>

    <v-col cols="12">
      <v-btn
        color="secondary"
        large
        @click="$emit('addItem')"
      >
        <translated-text
          :trans-key="`studentResume.section.${name}.add`"
        />
      </v-btn>
    </v-col>
  </v-row>
</template>

<script>
  import TranslatedText from "../../../TranslatedText";

  export default {
    components: {
      TranslatedText,
    },

    props: {
      name: {
        required: true,
        type: String,
      },
    },
  };
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  .subsection {
    margin-top: 1.5em;

    .header {
      font-size: 200%;
      font-weight: normal;
      text-align: left;
      color: $fer-black;
    }

    .items {

      > * {
        margin-top: 1em;

        &:first-child {
          margin-top: 0;
        }
      }
    }
  }
</style>
