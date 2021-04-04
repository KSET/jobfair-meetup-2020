import Vue from "vue";

const CONSENT_ACCEPTED = "ACCEPTED";
const CONSENT_DENIED = "DENIED";
const CONSENT_UNDECIDED = "UNDECIDED";

const COOKIE_NAME = "jf-meetup-cookie-consent";

export const state = () => (
  {
    consent: CONSENT_UNDECIDED,
  }
);

export const getters = {
  hasConsent(state) {
    return state.consent === CONSENT_ACCEPTED;
  },

  showConsent(state) {
    return state.consent === CONSENT_UNDECIDED;
  },
};

export const mutations = {
  SET_CONSENT(store, consentValue) {
    Vue.set(store, "consent", consentValue);
  },
};

export const actions = {
  async fetchConsent({ dispatch }) {
    const consent = this.$cookies.get(COOKIE_NAME);

    await dispatch(
      "processConsent",
      {
        status: consent || CONSENT_UNDECIDED,
      },
    );
  },

  async acceptConsent({ dispatch }) {
    await dispatch(
      "processConsent",
      {
        status: CONSENT_ACCEPTED,
      },
    );
  },

  async denyConsent({ dispatch }) {
    await dispatch(
      "processConsent",
      {
        status: CONSENT_DENIED,
      },
    );
  },

  async clearConsent({ dispatch }) {
    await dispatch(
      "processConsent",
      {
        status: CONSENT_UNDECIDED,
      },
    );
  },

  async processConsent({ commit }, { status }) {
    await commit("SET_CONSENT", status);

    const cookieValue = this.$cookies.get(COOKIE_NAME);
    const cookieValueMatches = cookieValue === status;
    if (!cookieValue || !cookieValueMatches) {
      const nextMonth = new Date();
      nextMonth.setMonth((nextMonth.getMonth() + 1) % 12);

      this.$cookies.set(
        COOKIE_NAME,
        status,
        {
          expires: nextMonth,
          path: "/",
        },
      );
    }

    if (!this.$ga) {
      return;
    }

    switch (status) {
      case CONSENT_ACCEPTED:
        this.$ga.enable();
        this.$ga.page(this.$router);
        break;

      default:
        this.$ga.disable();
        break;
    }
  },

  async nuxtServerInit({ dispatch }) {
    await dispatch("fetchConsent");
  },
};
