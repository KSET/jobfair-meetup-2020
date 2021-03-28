import Vue from "vue";
import {
  TOPIC_NAMES_BY_ID,
} from "../helpers/qna";

export const state = () => ({
  items: [],
});

export const getters = {
  getItems(state) {
    return state.items;
  },
};

export const mutations = {
  SET_ITEMS(state, items) {
    Vue.set(state, "items", items);
  },
};

export const actions = {
  async fetchAllCompanyApplicationItems({ commit }) {
    const { data } = await this.$api.$get("/qna/company-applications").catch((e) => e);

    const items = Object.fromEntries(
      Object
        .entries(data || {})
        .map(([ categoryId, categoryItems ]) => [
          TOPIC_NAMES_BY_ID.companyApplications[categoryId],
          categoryItems,
        ]),
    );

    commit("SET_ITEMS", items);

    return items;
  },

  async addItem(
    _context,
    {
      question,
      answer,
      categoryId,
    },
  ) {
    return await this.$api.$post("/qna", {
      question,
      answer,
      categoryId,
    }).catch((e) => e);
  },

  deleteItem(_context, { id }) {
    return this.$api.$delete(`/qna/${ id }`).catch((e) => e);
  },

  changeItemOrder(_context, { id, by }) {
    return this.$api.$patch(`/qna/change-order/${ id }`, { by }).catch((e) => e);
  },
};
