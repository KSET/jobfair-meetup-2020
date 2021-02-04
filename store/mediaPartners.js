export const state = () => ({});

export const getters = {};

export const mutations = {};

export const actions = {
  async addMediaPartner(_context, formData) {
    return await this.$api.$post("/participants/media-partners", formData).catch((e) => e);
  },

  deleteMediaPartner(_context, { id }) {
    return this.$api.$delete(`/participants/media-partners/${ id }`).catch((e) => e);
  },

  async fetchAllItems(_context) {
    const { data } = await this.$api.$get("/participants/media-partners").catch((e) => e);

    return data || [];
  },

  async swapMediaPartnersOrder(_context, { a, b }) {
    return await this.$api.$post("/participants/media-partners/swap", { a, b }).catch((e) => e);
  },
};
