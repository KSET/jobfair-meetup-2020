<template>
  <table :class="$style.table">
    <thead>
      <tr
        :class="$style.headerRow"
      >
        <th
          v-for="header of headers"
          :key="header"

          :class="$style.header"

          v-text="header"
        />
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(valueList, id) in values"
        :key="id"

        :class="$style.tableRow"
      >
        <td
          v-for="(value, id) in valueList"
          :key="`${id}=${value}`"

          :class="$style.entry"

          v-text="value"
        />
      </tr>
    </tbody>
  </table>
</template>

<script>
  export default {
    name: "InfoTable",

    props: {
      headers: {
        type: Array,
        required: true,
      },

      values: {
        type: Array,
        required: true,
      },
    },
  };
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  .table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
  }

  .headerRow {

    .header {
      padding: .5em 0;
      text-align: left;
      text-transform: uppercase;
      opacity: .6;
      color: $fer-black;
      border-bottom: 1px solid transparentize($fer-black, .85);
    }
  }

  .tableRow {

    .entry {
      padding: .75em 0;
      opacity: .8;
      color: $fer-black;
    }
  }
</style>
