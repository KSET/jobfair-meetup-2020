export const state = () => ({});

export const getters = {};

export const mutations = {};

export const actions = {
  async createPressKit(_context, { title, fileId, imageId }) {
    return await this.$api.$post("/press-kit", { title, fileId, imageId }).catch((e) => e);
  },

  async deletePressKit(_context, { id }) {
    return await this.$api.$delete(`/press-kit/${ id }`).catch((e) => e);
  },

  async fetchAllItems() {
    const { data } = await this.$api.$get("/press-kit/all").catch((e) => e);

    return data || [];
  },

  async swapPressKit(_context, { a, b }) {
    return await this.$api.$post("/press-kit/swap", { a, b }).catch((e) => e);
  },
};
