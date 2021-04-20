import Vue from "vue";
import {
  EntryType,
} from "~/components/student/resume/entry-type";

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

  getResumeSections(state) {
    const { resume } = state;

    if (!resume) {
      return null;
    }

    const resumeUrl = resume.pdfUrl;

    const basicInfo = Object.fromEntries(Object.entries({
      fullName: {
        text: resume.fullName,
      },
      city: {
        text: resume.city,
      },
      birthday: {
        text: resume.birthday,
        type: EntryType.Date,
      },
      phone: {
        text: resume.phone,
        type: EntryType.Phone,
      },
      email: {
        text: resume.email,
        type: EntryType.Email,
      },
      githubUrl: {
        text: resume.githubUrl,
        type: EntryType.Url,
      },
      linkedinUrl: {
        text: resume.linkedinUrl,
        type: EntryType.Url,
      },
    }).filter(([ , { text } ]) => text));

    return {
      basicInfo,
      education: {
        headers: [ "Obrazovna institucija", "Usmjerenje", "Godina završetka" ],
        values: resume.educations.map(({ awardedTitle: _awardedTitle, module, name, year }) => [ name, module, year ]),
      },
      projects: {
        headers: [ "Tvrtka / projekt", "Pozicija", "Trajanje" ],
        values: resume.workExperiences.map(({ company, description, years }) => [ company, description, years ]),
      },
      technicalSkills: resume.computerSkills,
      otherSkills: resume.skills,
      languages: {
        headers: [ "Jezik", "Razina" ],
        values: resume.languages,
      },
      awards: {
        headers: [ "Award", "Godina" ],
        values: resume.awards,
      },
      resume: resumeUrl,
      resumeId: resume.id,
    };
  },
};

export const mutations = {
  SET_RESUME(state, resume) {
    Vue.set(state, "resume", resume);
  },
};

export const actions = {
  async refreshUser({ dispatch }) {
    await dispatch(
      "user/fetchCurrentUser",
      null,
      {
        root: true,
      },
    );
  },

  async submitResume({ dispatch }, data) {
    const result = await this.$api.$post("/resumes/resume", data);

    if (!result?.error) {
      await dispatch("refreshUser");
    }

    return result;
  },

  async deleteResume({ dispatch }) {
    const { data, error = true } = await this.$api.$delete("/resumes/resume");

    if (!error) {
      await dispatch("refreshUser");
    }

    return data;
  },

  async fetchResumes() {
    const { data } = await this.$api.$get("/resumes/list");

    return data || [];
  },

  async fetchResume({ commit }, { resumeId }) {
    const { data } = await this.$api.$get(`/resumes/info/${ resumeId }`);

    if (data) {
      // data.pdfUrl = `/api/resumes/info/${ resumeId }.pdf`;
      data.pdfUrl = data.resumeFileData;
    }

    await commit("SET_RESUME", data);

    return data;
  },

  async fetchResumeByUid({ commit }, { uid }) {
    const { data } = await this.$api.$get(`/resumes/for-user/${ encodeURIComponent(uid) }`);

    if (data) {
      // data.pdfUrl = `/api/resumes/info/${ resumeId }.pdf`;
      data.pdfUrl = data.resumeFileData;
    }

    await commit("SET_RESUME", data);

    return data;
  },

  async scanResume(_context, { uid }) {
    const { data } = await this.$api.$post(
      "/resumes/scans/scan",
      {
        uid,
      },
    );

    return data;
  },

  addToFavourites(_context, { resumeId }) {
    return this.$api.$post(
      "/resumes/favourites/add",
      {
        resumeId,
      },
    );
  },

  removeFromFavourites(_context, { resumeId }) {
    return this.$api.$delete(`/resumes/favourites/remove/${ resumeId }`);
  },

  async listFavourites() {
    const { data = [] } = await this.$api.$get("/resumes/favourites/list");

    return Object.fromEntries(data.map((id) => [ id, id ]));
  },

  async listScans() {
    const { data = [] } = await this.$api.$get("/resumes/scans/list");

    return Object.fromEntries(data.map((id) => [ id, id ]));
  },
};
