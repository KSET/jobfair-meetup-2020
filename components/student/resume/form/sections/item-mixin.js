export default {
  props: {
    item: {
      required: true,
      type: Object,
    },
  },

  watch: {
    item: {
      deep: true,
      handler(val) {
        this.$emit("change", val);
      },
    },
  },
};
