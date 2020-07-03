import Vue from "vue";
import {
  hasPermission,
  roleNames,
} from "~/api/helpers/permissions";

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
  async fetchPages({ commit, rootGetters }, { userRole = roleNames.ADMIN }) {
    const { data: rawData } = await this.$api.$get("/pages/admin");

    const getSetting = rootGetters["settings/getSetting"];
    const canViewPage = ({ requiredRole }) => hasPermission(requiredRole, userRole);

    const data =
      rawData
        .filter(canViewPage)
        .map(
          ({ setting, requiredRole: _, ...rest }) => {
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
