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
  async fetchPages({ commit, rootGetters }) {
    const { data: rawData } = await this.$api.$get("/pages/list");

    const getSetting = rootGetters["settings/getSetting"];

    const data =
      rawData
        .map(
          ({ setting, ...rest }) => {
            if (!setting) {
              return rest;
            }

            return ({
              ...rest,
              href: getSetting(setting, "#"),
            });
          },
        )
    ;

    await commit("SET_PAGES", data);

    return data;
  },
};
