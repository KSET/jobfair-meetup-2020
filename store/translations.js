import Vue from "vue";

export const state = () => (
  {
    translations: {},
    editable: false,
    definedKeys: new Set(),
    undefinedKeys: new Set(),
  }
);

export const getters = {
  translation({ translations }) {
    return (key) => translations[key] || key;
  },

  isEditable({ editable }) {
    return editable;
  },
};

export const mutations = {
  SET_TRANSLATIONS(state, translations) {
    const definedKeys = new Set(Object.keys(translations));

    Vue.set(state, "translations", translations);
    Vue.set(state, "definedKeys", definedKeys);

    const undefinedKeys = [ ...definedKeys ].filter((key) => !definedKeys.has(key));
    Vue.set(state, "undefinedKeys", new Set(undefinedKeys));
  },

  SET_TRANSLATION(state, { key, value }) {
    Vue.set(state.translations, key, value);

    state.definedKeys.add(key);
    state.undefinedKeys.delete(key);
  },

  SET_EDITABLE(state, editable = true) {
    Vue.set(state, "editable", editable);
  },

  ADD_TRANSLATION_KEY(state, key) {
    if (false === state.definedKeys.has(key)) {
      state.undefinedKeys.add(key);
    }
  },
};

export const actions = {
  async fetchTranslations({ commit }) {
    const { data } = await this.$api.$get("/translations/all");

    commit("SET_TRANSLATIONS", data);

    return data;
  },

  async updateTranslation({ commit }, { key, value }) {
    const { data, ...rest } = await this.$api.$patch(
      `/translations/${ key }`,
      {
        value:
          value
            .trim()
            .replace(/^(<br>)+/i, "")
            .replace(/(<br>)+$/i, "")
        ,
      },
    ).catch((err) => err);

    if (data) {
      commit("SET_TRANSLATION", data);
    }

    return { data, ...rest };
  },

  async syncNewTranslations({ commit, state }) {
    if (0 === state.undefinedKeys.size) {
      return;
    }

    const { data } = await this.$api.$put("/translations", [ ...state.undefinedKeys ]);

    commit("SET_TRANSLATIONS", data);
  },

  async nuxtServerInit({ dispatch }) {
    await dispatch("fetchTranslations");
  },
};
