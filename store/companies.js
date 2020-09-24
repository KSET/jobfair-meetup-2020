import Vue from "vue";

export const state = () => (
  {
    event: null,
  }
);

export const getters = {
  getEvent(state) {
    return state.event;
  },
};

export const mutations = {
  SET_EVENT(state, event) {
    Vue.set(state, "event", event);
  },
};

export const actions = {
  async fetchParticipants() {
    const { data } = await this.$api.$get("/companies/participants");

    return data;
  },

  async fetchEvent({ commit }, { type, id }) {
    const { data } = await this.$api.$get(`/companies/events/${ encodeURIComponent(type) }/${ encodeURIComponent(id) }`).catch((e) => e);

    commit("SET_EVENT", data);

    return data;
  },

  async fetchParticipantEvents() {
    const { data } = await this.$api.$get("/companies/events").catch((e) => e);

    const {
      companies: rawCompanies,
      presentations: rawPresentations,
      workshops: rawWorkshops,
    } = data;

    if (!rawCompanies || !rawPresentations || !rawWorkshops) {
      console.log("|> COMPANY FETCH ERROR", new Error("company-fetch-error"), { rawWorkshops, rawPresentations, rawCompanies });

      return [];
    }

    const companies = Object.fromEntries(
      rawCompanies
        .map(({ id, ...rest }) => [ id, rest ]),
      )
    ;

    const presentations =
      rawPresentations
        .map(
          ({ company, ...rest }) => ({
            ...rest,
            company: companies[company.id],
            type: "talk",
          }),
        )
    ;

    const workshops =
      rawWorkshops
        .map(
          ({ company, name, ...rest }) => ({
            ...rest,
            company: companies[company.id],
            type: "workshop",
            title: name,
            topic: "Workshop",
          }),
        )
    ;

    return (
      [
        ...presentations,
        ...workshops,
      ]
        .map(
          ({ occures_at, ...rest }) =>
            ({ ...rest, date: new Date(occures_at) })
          ,
        )
        .sort(
          (a, b) =>
            b.date - a.date
          ,
        )
    );
  },
};
