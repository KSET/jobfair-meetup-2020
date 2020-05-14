export const state = () => (
  {
    open: false,
  }
);

export const getters = {
  isOpen({ open }) {
    return open;
  },
};

export const mutations = {
  SET_OPEN(state, open = true) {
    state.open = open;
  },

  TOGGLE_OPEN(state) {
    state.open = !state.open;
  },
};

export const actions = {};
