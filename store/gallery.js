export const state = () => ({});

export const getters = {};

export const mutations = {};

export const actions = {
  async updateGallery(_context, { id, title, description, imageId }) {
    return await this.$api.$post("/gallery", { id, title, description, imageId }).catch((e) => e);
  },

  deleteGallery(_context, { id }) {
    return this.$api.$delete(`/gallery/${ id }`).catch((e) => e);
  },

  async fetchAllItems(_context) {
    const { data } = await this.$api.$get("/gallery/list").catch((e) => e);

    return data || [];
  },

  async swapGallery(_context, { a, b }) {
    return await this.$api.$post("/gallery/swap", { a, b }).catch((e) => e);
  },
};
