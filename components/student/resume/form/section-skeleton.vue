<template>
  <v-card
    outlined
  >
    <v-card-text class="pb-0">
      <slot />
    </v-card-text>

    <v-card-actions class="pa-4 pt-0">
      <v-btn
        color="primary"
        large
        @click="$emit('removeEntry')"
      >
        <translated-text trans-key="studentResume.section.btn.remove" />
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
  import TranslatedText from "../../../TranslatedText";

  export default {
    components: {
      TranslatedText,
    },
  };
</script>
