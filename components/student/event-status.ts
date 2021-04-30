const ensureEnumKeysSameAsValues = <T>(_kv: { [K in keyof T]: K }) => null;

export enum EventType {
  workshop = "workshop",
  talk = "talk",
  panel = "panel",
}

ensureEnumKeysSameAsValues(EventType);

export interface Event {
  type: EventType
}

interface EventStatusEntry {
  value: number;
  filter: ({ type }: Event) => boolean;
}

type EventStatusType = Record<string, EventStatusEntry>;

let i = 0;
export const EventStatus: Readonly<EventStatusType> = Object.freeze({
  event: {
    value: 2 ** (i++),
    filter: () => true,
  },
  networking: {
    value: 2 ** (i++),
    filter: ({ type }) => EventType.talk === type,
  },
  online: {
    value: 2 ** (i++),
    filter: ({ type }) => EventType.workshop !== type,
  },
});

/**
 * @param {EventStatus} event
 * @return {string[]}
 */
export const eventStatusForEvent =
  (event: Event): string[] =>
    Object
      .entries(EventStatus)
      .filter(
        ([ , { filter } ]) =>
          filter(event)
        ,
      )
      .map(
        ([ key ]) =>
          key
        ,
      )
;

/**
 * @param {string[]} eventList
 * @return {number}
 */
export const statusFromEventList =
  (eventList: (keyof EventStatusType)[]): number =>
    eventList
      .map((s) => EventStatus[s].value)
      // eslint-disable-next-line no-bitwise
      .reduce((acc, x) => acc | x, 0)
;

/**
 * @param {number} status
 * @return {string[]}
 */
export const eventListFromStatus =
  (status: number): (keyof EventStatusType)[] =>
    Object
      .entries(EventStatus)
      // eslint-disable-next-line no-bitwise
      .filter(([ , { value } ]) => value & status)
      .map(([ key ]) => key)
;

export const getParticipantCapacityFor = (eventType: EventType): number => {
  switch (eventType) {
    case "workshop":
      return 15;
    case "talk":
    case "panel":
      return 50;
    default:
      return 0;
  }
};

/**
 * @param {string} eventType
 * @param {number} currentParticipants
 * @return {boolean}
 */
export const hasParticipantCapacityFor = (eventType: EventType, currentParticipants = 0): boolean => {
  const maxParticipants = getParticipantCapacityFor(eventType);

  return currentParticipants < maxParticipants;
};
