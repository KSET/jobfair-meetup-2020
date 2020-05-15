import Vue from "vue";

export const state = () => (
  {
    translations: {},
  }
);

export const getters = {
  translation({ translations }) {
    return (key) => translations[key];
  },
};

export const mutations = {
  SET_TRANSLATIONS(state, translations) {
    Vue.set(state, "translations", translations);
  },
};

export const actions = {
  async fetchTranslations({ commit }) {
    const { data } = await this.$api.$get("/translations/all");

    commit("SET_TRANSLATIONS", data);

    return data;
  },
};
