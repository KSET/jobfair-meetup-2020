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

    const eventListToObject =
      (eventList) =>
        Object
          .fromEntries(
            eventList
              .map(({ eventId, status }) => [ eventId, status ])
            ,
          )
    ;

    return (
      Object
        .entries(data)
        .reduce(
          (acc, [ type, eventList ]) =>
            Object.assign(
              acc,
              {
                [type]: eventListToObject(eventList),
              },
            ),
          {},
        )
    );
  },

  async fetchEventsParticipants() {
    const { data } = await this.$api.$get("/events/participants", { progress: false });

    return data || [];
  },

  async fetchEventParticipants(_context, { eventId, eventType }) {
    const { data } = await this.$api.$get(`/events/participants/${ eventType }/${ eventId }`, { progress: false });
    const noParticipants = Object.fromEntries(Object.keys(EventStatus).map((k) => [ k, 0 ]));

    return { ...noParticipants, ...data };
  },

  async markEventStatus(_context, { eventId, eventType, selected }) {
    // eslint-disable-next-line no-bitwise
    const status = statusFromEventList(selected);
    const id = Number(eventId);
    const type = String(eventType);

    const { data } = await this.$api.$post("/events/status", { id, type, status }, { progress: false });

    return data;
  },
};
