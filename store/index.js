import {
  isModerator,
} from "~/api/helpers/permissions";

export const state = () => ({});

export const getters = {};

export const mutations = {};

export const actions = {
  async nuxtServerInit({ dispatch }, context) {
    const nuxtServerInits =
      Object
        .keys(context.store._modules.root._children)
        .map((moduleName) => `${ moduleName }/nuxtServerInit`)
        .filter((initFnName) => this._actions[initFnName])
    ;

    await Promise.all(
      nuxtServerInits.map((initFnName) => dispatch(initFnName, context)),
    );

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
