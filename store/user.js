import Vue from "vue";
import {
  isAdmin,
  isModerator,
  isStudent,
} from "~/api/helpers/permissions";
import {
  isGateGuardian,
} from "~/helpers/auth";

export const state = () => (
  {
    user: null,
  }
);

export const getters = {
  getUser({ user }) {
    return user;
  },

  getCompany(store) {
    const { user } = store;
    const { companies = [] } = user;

    if (0 < companies.length) {
      return companies[0];
    }

    return null;
  },

  getResume(store) {
    return store.user.resume;
  },

  isModerator({ user }) {
    return isModerator(user.role);
  },

  isAdmin({ user }) {
    return isAdmin(user.role);
  },

  isStudent({ user }) {
    return isStudent(user.role);
  },

  isGateGuardian({ user }) {
    return isGateGuardian(user);
  },

  isLoggedIn({ user }) {
    return Boolean(user);
  },

  hasCv({ user }) {
    return Boolean(user?.resume?.uid);
  },

  hasCompany({ user }) {
    return Boolean(user?.companies?.length || 0);
  },
};

export const mutations = {
  SET_USER(state, user) {
    Vue.set(state, "user", user);
  },
};

export const actions = {
  async fetchCurrentUser({ commit }) {
    try {
      const { data } = await this.$api.$get("/auth/user");

      commit("SET_USER", data);

      return data;
    } catch (e) {
      commit("SET_USER", null);

      return null;
    }
  },

  async doLogin({ commit }, { email, password }) {
    try {
      const { data = null } = await this.$api.$post(
        "/auth/login",
        {
          email,
          password,
        },
      );

      await commit("SET_USER", data);

      return data;
    } catch (e) {
      return null;
    }
  },

  async doLogout({ commit }) {
    await commit("SET_USER", null);
  },

  async doRegister(_context, data) {
    return await this.$api.$post("/auth/register", data);
  },

  async nuxtServerInit({ dispatch }) {
    await dispatch("fetchCurrentUser");
  },
};
