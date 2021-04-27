<template>
  <section-skeleton
    @removeEntry="$emit('removeEntry')"
  >
    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="item.name"
          label="Obrazovna institucija"
          outlined
          placeholder="Fakultet Elektrotehnike i Računarstva"
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="item.module"
          label="Usmjerenje"
          outlined
          placeholder="Programsko inženjerstvo"
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="item.year"
          label="Godina završetka (stvarna ili predviđena)"
          outlined
          placeholder="2020"
          type="number"
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
