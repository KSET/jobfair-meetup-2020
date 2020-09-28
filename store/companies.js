import Vue from "vue";
import {
 pipe,
} from "~/helpers/object";

export const state = () => (
  {
    event: null,
    company: null,
  }
);

export const getters = {
  getEvent(state) {
    return state.event;
  },

  getCompany(state) {
    return state.company;
  },
};

export const mutations = {
  SET_EVENT(state, event) {
    Vue.set(state, "event", event);
  },

  SET_COMPANY(state, company) {
    Vue.set(state, "company", company);
  },
};

export const actions = {
  async fetchParticipants() {
    const { data } = await this.$api.$get("/companies/participants");

    return data;
  },

  async fetchInfo({ commit }, { id }) {
    const { data } = await this.$api.$get(`/companies/info/${ encodeURIComponent(id) }`).catch((e) => e);

    commit("SET_COMPANY", data);

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
      presentations: rawPresentations = [],
      workshops: rawWorkshops = [],
      panels: rawPanels = [],
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

    const fixPanel =
      pipe(
        ({ companies: rawCompanies, date, ...panel }) => ({
          ...panel,
          companies: rawCompanies.map(({ companyId, ...rest }) => ({
            info: companies[companyId],
            ...rest,
          })),
          type: "panel",
          location: "KSET",
          occuresAt: date,
        }),
        (panel) => ({
          ...panel,
          company: panel.companies[0].info,
        }),
      )
    ;
    const panels = rawPanels.map(fixPanel);

    return (
      [
        ...presentations,
        ...workshops,
        ...panels,
      ]
        .map(
          ({ occuresAt, ...rest }) =>
            ({ ...rest, date: new Date(occuresAt) })
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
