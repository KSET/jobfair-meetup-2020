import Vue from "vue";

export const state = () => (
  {
    pages: [],
  }
);

export const getters = {
  getPages({ pages }) {
    return pages;
  },
};

export const mutations = {
  SET_PAGES(store, pages) {
    Vue.set(store, "pages", pages);
  },
};

export const actions = {
  async fetchPages({ commit }) {
    const { data } = await this.$api.$get("/pages/list");

    await commit("SET_PAGES", data);

    return data;
  },
};
