import {
  isModerator,
} from "~/api/helpers/permissions";

export const state = () => ({});

export const getters = {};

export const mutations = {};

export const actions = {
  async nuxtServerInit({ dispatch, getters }) {
    await dispatch("user/nuxtServerInit");
    await dispatch("settings/nuxtServerInit");
    await dispatch("translations/nuxtServerInit");
    await dispatch("pages/fetchPages");

    const user = getters["user/getUser"];

    if (!user) {
      return;
    }

    // User specific part

    if (isModerator(user.role)) {
      await dispatch("adminPages/fetchPages", { userRole: user.role });
    }
  },
};
