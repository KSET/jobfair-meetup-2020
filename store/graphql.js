export const state = () => ({});

export const getters = {};

export const mutations = {};

export const actions = {
  async query(_context, { query, operationName, variables }) {
    const { data } = await this.$api.$post("/graphql/proxy", { query, operationName, variables }).catch((e) => e);

    return data;
  },
};
