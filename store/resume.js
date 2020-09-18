import Vue from "vue";

export const state = () => ({
  resume: null,
});

export const getters = {
  getResume(state) {
    return state.resume;
  },

  getResumeUrl(state) {
    return state.resume.pdfUrl;
  },
};

export const mutations = {
  SET_RESUME(state, resume) {
    Vue.set(state, "resume", resume);
  },
};

export const actions = {
  async fetchResumes() {
    const { data } = await this.$api.$get("/resumes/list");

    return data || [];
  },

  async fetchResume({ commit }, { resumeId }) {
    const { data } = await this.$api.$get(`/resumes/info/${ resumeId }`);

    if (data) {
      data.pdfUrl = `/api/resumes/info/${ resumeId }.pdf`;
    }

    await commit("SET_RESUME", data);

    return data;
  },
};
