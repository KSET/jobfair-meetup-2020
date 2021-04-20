<template>
  <v-menu
    ref="menu"
    v-model="menu"
    :close-on-content-click="false"
    max-width="290px"
    min-width="auto"
    offset-y
    transition="scale-transition"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-text-field
        v-model="dateFormatted"
        v-bind="{ ...attrs, ...$attrs }"
        clearable
        hint="DD. MM. GGGG. format"
        persistent-hint
        v-on="on"
        @blur="date = parseDate(dateFormatted)"
      />
    </template>
    <v-date-picker
      v-model="date"
      no-title
      @input="menu = false"
    />
  </v-menu>
</template>

<script>
  import {
    formatDate,
    parseDate,
  } from "../../../../helpers/date";

  export default {
    name: "MenuDatePicker",

    inheritAttrs: false,

    props: {
      value: {
        required: false,
        type: [ Date, String ],
        default() {
          return new Date();
        },
      },
    },

    data: (vm) => ({
      menu: false,
      date: vm.parseDate(vm.formatDate(vm.$props.value)),
      dateFormatted: vm.formatDate(vm.$props.value),
    }),

    watch: {
      date() {
        this.dateFormatted = this.formatDate(this.date);

        this.$emit("input", this.date);
      },
    },

    methods: {
      formatDate(date) {
        if (!date) {
          return null;
        }

        return formatDate(date);
      },

      parseDate(formattedDate) {
        if (!formattedDate) {
          return null;
        }

        return parseDate(formattedDate).toISOString();
      },
    },
  };
</script>
