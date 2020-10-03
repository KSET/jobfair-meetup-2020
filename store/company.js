import Vue from "vue";

export const state = () => ({
  entry: null,
});

export const getters = {
  getCompany(state) {
    return state.entry;
  },
};

export const mutations = {
  SET_COMPANY(state, entry) {
    Vue.set(state, "entry", entry);
  },
};

