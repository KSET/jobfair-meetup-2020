import Vue from "vue";

export const state = () => ({
  panel: null,
});

export const getters = {
  getPanel(state) {
    return state.panel;
  },
};

export const mutations = {
  SET_PANEL(state, panel) {
    Vue.set(state, "panel", panel);
  },
};

export const actions = {
  async createPanel(_context, { payload }) {
    return await this.$api.$post(
      "/panels",
      payload,
    );
  },

  async updatePanel(_context, { id, payload }) {
    return await this.$api.$patch(
      `/panels/${ id }`,
      payload,
    );
  },

  deletePanel(_context, { id }) {
    return this.$api.$delete(`/panels/${ id }`);
  },

  async fetchListWithInfo() {
    const { data } = await this.$api.$get(
      "/panels/list/with-info",
    );

    return data;
  },

  async fetchPanelInfo({ commit }, { id }) {
    try {
      const { data } = await this.$api.$get(
        `/panels/info/${ id }`,
      );

      commit("SET_PANEL", data);

      return data;
    } catch (e) {
      return null;
    }
  },
};
