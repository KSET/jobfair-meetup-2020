import Vue from "vue";

export const state = () => (
  {
    settings: {},
  }
);

export const getters = {
  getSettings({ settings }) {
    return settings;
  },

  getSetting({ settings }) {
    return (
      (key, fallback = "") =>
        settings[key] === undefined
        ? fallback
        : settings[key]
    );
  },
};

export const mutations = {
  SET_SETTINGS(store, settings) {
    Vue.set(store, "settings", settings);
  },

  SET_SETTING(store, setting) {
    if (!setting) {
      return;
    }

    const { key, value } = setting;

    if (!key || !value) {
      return;
    }

    Vue.set(store.settings, key, value);
  },
};

export const actions = {
  async fetchSettings({ commit }) {
    const { data: rawData } = await this.$api.$get("/settings/list").catch((e) => e);

    if (!rawData) {
      return rawData;
    }

    const data = Object.fromEntries(
      rawData.map(
        ({ key, value }) =>
          [ key, value ]
        ,
      ),
    );

    await commit("SET_SETTINGS", data);

    return data;
  },

  async updateSetting({ commit }, { key, value }) {
    const data = await this.$api.$post("/settings", { key, value }).catch((e) => e);

    if (data.data) {
      commit("SET_SETTING", data.data);
    }

    return data;
  },

  async nuxtServerInit({ dispatch }) {
    await dispatch("fetchSettings");
  },
};
