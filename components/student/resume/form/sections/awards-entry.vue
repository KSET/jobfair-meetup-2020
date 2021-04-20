<template>
  <section-skeleton
    @removeEntry="$emit('removeEntry')"
  >
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="item.title"
          label="Nagrada/priznanje"
          outlined
          placeholder="Prvo mjesto na XY hackathonu"
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="item.year"
          label="Godina"
          outlined
          placeholder="2017"
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
