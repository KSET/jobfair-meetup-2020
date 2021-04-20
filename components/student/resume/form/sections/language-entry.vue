<template>
  <section-skeleton
    @removeEntry="$emit('removeEntry')"
  >
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="item.name"
          label="Strani jezik"
          outlined
          placeholder="Engleski"
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-select
          v-model="item.skillLevel"
          :items="['A1', 'A2', 'B1', 'B2', 'C1', 'C2']"
          label="Razina"
          outlined
        />
      </v-col>
    </v-row>
  </section-skeleton>
</template>

<script>
  import SectionSkeleton from "../section-skeleton";
  import itemMixin from "./item-mixin";

  export default {
    components: {
      SectionSkeleton,
    },

    mixins: [
      itemMixin,
    ],
  };
</script>
