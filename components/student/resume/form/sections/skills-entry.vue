<template>
  <section-skeleton
    @removeEntry="$emit('removeEntry')"
  >
    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="item.name"
          label="Vještina"
          outlined
          placeholder="Project Management"
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
