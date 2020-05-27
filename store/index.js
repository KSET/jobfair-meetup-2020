export const state = () => ({});

export const getters = {};

export const mutations = {};

export const actions = {
  async nuxtServerInit({ dispatch }) {
    await dispatch("pages/fetchPages");
    await dispatch("user/nuxtServerInit");
    await dispatch("translations/nuxtServerInit");
    await dispatch("settings/nuxtServerInit");
  },
};
