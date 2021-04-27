<template>
  <section-skeleton
    @removeEntry="$emit('removeEntry')"
  >
    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="item.company"
          label="Tvrtka/projekt"
          outlined
          placeholder="JobFair Meetup"
        />
      </v-col>

      <v-col cols="12">
        <v-text-field
          v-model="item.description"
          label="Pozicija"
          outlined
          placeholder="Account Manager"
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="item.years"
          label="Trajanje (MM.GGGG-MM.GGGG)"
          outlined
          placeholder="01.2021-06.2021"
        />
      </v-col>

      <v-col class="text-center" cols="12" md="6">
        <v-checkbox
          v-model="item.currentEmployer"
          label="Trenutno sam zaposlen tamo"
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
