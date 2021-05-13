import Vue from "vue";

export const state = () => ({
  live: true,
  online: true,
});

export const getters = {
  isLive(state) {
    return state.live;
  },

  isOnline(state) {
    return state.online;
  },
};

export const mutations = {
  SET_LIVE(state, live) {
    Vue.set(state, "live", live);
  },

  SET_ONLINE(state, online) {
    Vue.set(state, "online", online);
  },
};

export const actions = {
  async fetchLiveStatus({ commit }) {
    const { data } = await this.$api.$get(
      "/meta/health/live",
      {
        progress: false,
      },
    );

    commit("SET_LIVE", data);

    return data;
  },

  async nuxtServerInit({ dispatch }) {
    await dispatch("fetchLiveStatus");
  },
};

