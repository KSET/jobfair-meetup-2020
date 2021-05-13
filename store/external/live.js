import Vue from "vue";

export const state = () => ({
  youtubeLiveVideoId: null,
});

export const getters = {
  youtubeId(state) {
    return state.youtubeLiveVideoId;
  },

  isLive(state, getters) {
    return Boolean(getters.youtubeId);
  },
};

export const mutations = {
  SET_YOUTUBE_ID(state, id) {
    Vue.set(state, "youtubeLiveVideoId", id);
  },
};

export const actions = {
  async fetchYoutubeLiveVideoId({ commit }) {
    const { data } = await this.$api.$get(
      "/external/info/youtube/live/video-id",
      {
        progress: false,
      },
    );

    commit("SET_YOUTUBE_ID", data);

    return data;
  },

  async nuxtServerInit({ dispatch }) {
    await dispatch("fetchYoutubeLiveVideoId");
  },
};

