export const state = () => ({});

export const getters = {};

export const mutations = {};

export const actions = {
  async addProjectFriend(_context, formData) {
    return await this.$api.$post("/participants/project-friends", formData).catch((e) => e);
  },

  deleteProjectFriend(_context, { id }) {
    return this.$api.$delete(`/participants/project-friends/${ id }`).catch((e) => e);
  },

  async fetchAllItems(_context) {
    const { data } = await this.$api.$get("/participants/project-friends").catch((e) => e);

    return data || [];
  },

  async swapProjectFriendsOrder(_context, { a, b }) {
    return await this.$api.$post("/participants/project-friends/swap", { a, b }).catch((e) => e);
  },
};
