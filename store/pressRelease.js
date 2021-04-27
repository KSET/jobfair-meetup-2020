import Vue from "vue";

export const state = () => ({
  item: null,
});

export const getters = {
  pressRelease({ item }) {
    return item;
  },
};

export const mutations = {
  SET_PRESS_RELEASE(state, pressRelease) {
    Vue.set(state, "item", pressRelease);
  },
};

export const actions = {
  async fetchAllPressReleases() {
    const { data } = await this.$api.$get("/press-release/all");

    return data;
  },

  async fetchPressRelease({ commit, state }, { id, force = false }) {
    if (!force && state.item && state.item.id === id) {
      return state.item;
    }

    const { data } = await this.$api.$get(`/press-release/release/${ id }`);

    const pressRelease = {
      ...data,
      fileId: data.file_id,
    };

    commit("SET_PRESS_RELEASE", pressRelease);

    return pressRelease;
  },

  async createPressRelease(_context, data) {
    return await this.$api.$put(
      "/press-release",
      data,
    );
  },

  async updatePressRelease(_context, data) {
    return await this.$api.$patch(
      `/press-release/${ data.id }`,
      data,
    );
  },

  deletePressRelease(_context, { id }) {
    return this.$api.$delete(
      `/press-release/${ id }`,
    );
  },
};
