import Vue from "vue";

export const state = () => ({
  entry: null,
});

export const getters = {
  getCompany(state) {
    return state.entry;
  },
};

export const mutations = {
  SET_COMPANY(state, entry) {
    Vue.set(state, "entry", entry);
  },
};

export const actions = {
  async getIndustries() {
    const { data } = await this.$api.$get(
      "/companies/industries",
    ) || [];

    return data;
  },

  async getDataFromVat(context, { vat }) {
    const { data } = await this.$api.$post(
      "/companies/vat/info/any",
      {
        vat,
      },
      {
        progress: false,
      },
    ) || {};

    return data;
  },

  async isVatValid(context, { vat }) {
    const { data } = await this.$api.$post(
      "/companies/vat/check",
      {
        vat,
      },
      {
        progress: false,
      },
    ) || {};

    return data || {};
  },
};

