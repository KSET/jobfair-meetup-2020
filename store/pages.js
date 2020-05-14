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
    const pages = [
      {
        name: "Blog",
        to: { name: "Blog:Home" },
      },
      {
        name: "O MeetUPu",
        to: { name: "About" },
      },
      {
        name: "Sudionici",
        to: { name: "Sudionici" },
      },
      {
        name: "Kontakt",
        to: { name: "Kontakt" },
      },
      {
        name: "Press",
        to: { name: "Press" },
      },
      {
        name: "Prijavi se",
        href: "https://jobfair.fer.unizg.hr/",
      },
    ];

    await commit("SET_PAGES", pages);

    return pages;
  },
};
