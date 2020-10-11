let i = 0;
/**
 * @readonly
 * @enum{Number}
 */
export const EventStatus = Object.freeze({
  event: {
    value: 2 ** (i++),
    filter: () => true,
  },
  networking: {
    value: 2 ** (i++),
    filter: ({ type }) => "talk" === type,
  },
});

/**
 * @param {EventStatus} event
 * @return {string[]}
 */
export const eventStatusForEvent =
  (event) =>
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
  (eventList) =>
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
  (status) =>
    Object
      .entries(EventStatus)
      // eslint-disable-next-line no-bitwise
      .filter(([ , { value } ]) => value & status)
      .map(([ key ]) => key)
;

export const getParticipantCapacityFor = (eventType) => {
  switch (eventType) {
    case "workshop":
      return 15;
    case "talk":
    case "panel":
      return 80;
    default:
      return 0;
  }
};

/**
 * @param {string} eventType
 * @param {number} currentParticipants
 * @return {boolean}
 */
export const hasParticipantCapacityFor = (eventType, currentParticipants = 0) => {
  const maxParticipants = getParticipantCapacityFor(eventType);

  return currentParticipants < maxParticipants;
};
