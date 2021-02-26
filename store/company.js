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

  async checkCompanyApplicationTokenValid(context, { token }) {
    const { data } = await this.$api.$post(
      "/companies/application/token/verify",
      {
        token,
      },
      {
        progress: false,
      },
    ) || {};

    return Boolean(data);
  },

  async submitCompanyApplication(context, formData) {
    return await this.$api.$post(
      "/companies/application/submit",
      formData,
      {
        progress: false,
      },
    ) || {};
  },

  async getCompanyApplications(context, { vat }) {
    const { data } = await this.$api.$get(
      `/companies/application/by-vat/${ encodeURIComponent(vat) }`,
      {
        progress: false,
      },
    ) || {};

    return data || [];
  },

  async getCompanyApplicationsAll() {
    const { data } = await this.$api.$get(
      "/companies/application/list/all",
      {
        progress: false,
      },
    ) || {};

    return data || [];
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

