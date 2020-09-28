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
  async createPanel(_context, { title, description, date, companies }) {
    return await this.$api.$post(
      "/panels",
      { title, description, date, companies },
    );
  },

  async updatePanel(_context, { id, panel: { title, description, date, companies } }) {
    return await this.$api.$patch(
      `/panels/${ id }`,
      { title, description, date, companies },
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
      console.log("|> FUCKY", e);

      return null;
    }
  },
};
