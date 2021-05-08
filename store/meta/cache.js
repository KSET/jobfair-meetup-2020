import Vue from "vue";

export const state = () => ({
  entries: [],
  entry: null,
});

export const getters = {
  allEntries(state) {
    return state.entries;
  },

  oneEntry(state) {
    return state.entry;
  },
};

export const mutations = {
  SET_ENTRIES(state, entries) {
    Vue.set(state, "entries", entries);
  },

  SET_ENTRY(state, entry) {
    Vue.set(state, "entry", entry);
  },

  REMOVE_ENTRY(state, key) {
    Vue.delete(state.entries, key);
  },
};

export const actions = {
  async fetchEntries({ commit }) {
    const { data } = await this.$api.$get(
      "/meta/cache/info",
      {
        progress: false,
      },
    );

    commit("SET_ENTRIES", data);

    return data;
  },

  async fetchEntry({ commit }, key) {
    const { data } = await this.$api.$get(
      `/meta/cache/info/for/${ key }`,
      {
        progress: false,
      },
    );

    commit("SET_ENTRY", data);

    return data;
  },

  async fetchEntriesWithData({ commit }) {
    const { data } = await this.$api.$get(
      "/meta/cache/info/with-data",
      {
        progress: false,
      },
    );

    commit("SET_ENTRIES", data);

    return data;
  },

  async fetchEntryWithData({ commit }, key) {
    const { data } = await this.$api.$get(
      `/meta/cache/info/for/${ key }/with-data`,
      {
        progress: false,
      },
    );

    commit("SET_ENTRY", data);

    return data;
  },

  async deleteEntry(_context, key) {
    const { data } = await this.$api.$delete(
      `/meta/cache/info/${ key }`,
      {
        progress: false,
      },
    );

    return data;
  },

  async refreshCache() {
    const { data } = await this.$api.$post(
      "/meta/cache/refresh",
      null,
      {
        progress: false,
      },
    );

    return data;
  },

  async refreshCacheFor(_context, key) {
    const { data } = await this.$api.$post(
      `/meta/cache/refresh/${ key }`,
      null,
      {
        progress: false,
      },
    );

    return data;
  },
};
