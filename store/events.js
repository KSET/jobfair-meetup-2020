import {
  EventStatus,
  statusFromEventList,
} from "../components/student/event-status";

export const actions = {
  async fetchEventStatusMine() {
    const { data } = await this.$api.$get("/events/mine", { progress: false });

    if (!data) {
      return [];
    }

    return Object.fromEntries(data.map(({ eventId, status }) => [ eventId, status ]));
  },

  async fetchEventsParticipants() {
    const { data } = await this.$api.$get("/events/participants", { progress: false });

    return data || [];
  },

  async fetchEventParticipants(_context, { eventId }) {
    const { data } = await this.$api.$get(`/events/participants/${ eventId }`, { progress: false });
    const noParticipants = Object.fromEntries(Object.keys(EventStatus).map((k) => [ k, 0 ]));

    return { ...noParticipants, ...data };
  },

  async markEventStatus(_context, { eventId, selected }) {
    // eslint-disable-next-line no-bitwise
    const status = statusFromEventList(selected);
    const id = Number(eventId);

    const { data } = await this.$api.$post("/events/status", { id, status }, { progress: false });

    return data;
  },
};
