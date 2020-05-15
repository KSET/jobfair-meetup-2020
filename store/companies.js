export const state = () => (
  {}
);

export const getters = {};

export const mutations = {};

export const actions = {
  async fetchParticipants() {
    const { data } = await this.$api.$get("/companies/participants");

    return data;
  },

  async fetchProjectFriends() {
    const { data } = await this.$api.$get("/companies/project-friends");

    return data;
  },
};
