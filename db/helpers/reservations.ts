import {
  Query,
} from "../methods";

/* eslint-disable camelcase */
export interface EventReservation {
  id: number;
  event_id: number;
  event_type: string;
  status: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

type EventReservationInfo = Pick<EventReservation, "event_id" | "event_type" | "status">;

export type EventReservationCount =
  EventReservationInfo
  & { count: number; }
  ;

export type EventReservationGroup =
  EventReservationInfo
  & { user_ids: string } // user_id.join(',')
  ;

/* eslint-enable camelcase */

export interface Data {
  eventType: EventReservation["event_type"];
  eventId: EventReservation["event_id"];
  userId: EventReservation["user_id"];
  status: EventReservation["status"];
}

export const queryReservationsGetByEventId =
  (
    {
      eventType,
      eventId,
    }: Pick<Data, "eventType" | "eventId">,
  ): Query => ({
    text: `
      select
        *
      from
        event_reservations
      where
            event_id = $1
        and event_type = $2
        and status <> 0
    `,
    values: [
      eventId,
      eventType,
    ],
  })
;

export const queryReservationsCountVisitorsByEvent =
  (): Query => ({
    text: `
      select
        event_id, event_type, status, count(status)
      from
        event_reservations
      where
        status <> 0
      group by
        event_id, event_type, status
    `,
    values: [],
  })
;

export const queryReservationsListUserIdsByEvent =
  (): Query => ({
    text: `
      select
          event_id
        , event_type
        , status
        , array_to_string(array_agg(distinct user_id), ',') as user_ids
      from
        event_reservations
      where
        status <> 0
      group by
          event_id
        , event_type
        , status
    `,
    values: [],
  })
;

export const queryReservationsCountVisitorsForEvent =
  (
    {
      eventType,
      eventId,
    }: Pick<Data, "eventType" | "eventId">,
  ): Query => ({
    text: `
      select
        event_id, event_type, status, count(status)
      from
        event_reservations
      where
             status <> 0
        and event_id = $1
        and event_type = $2
      group by
        event_id, event_type, status
    `,
    values: [
      eventId,
      eventType,
    ],
  })
;

export const queryReservationsGetByUserId =
  (
    {
      userId,
    }: Pick<Data, "userId">,
  ): Query => ({
    text: `
      select
        *
      from
        event_reservations
      where
            user_id = $1
        and status <> 0
    `,
    values: [
      userId,
    ],
  })
;

export const queryReservationsGetByEventAndUserId =
  (
    {
      eventId,
      eventType,
      userId,
    }: Pick<Data, "eventType" | "eventId" | "userId">,
  ): Query => ({
    text: `
      select
        *
      from
        event_reservations
      where
            event_id = $1
        and  user_id = $2
        and event_type = $3
    `,
    values: [
      eventId,
      userId,
      eventType,
    ],
  })
;

export const queryReservationsCreate =
  (
    {
      eventId,
      eventType,
      userId,
      status,
    }: Pick<Data, "eventType" | "eventId" | "userId" | "status">,
  ): Query => {
    const row = {
      status,
      // eslint-disable-next-line camelcase
      event_id: eventId,
      // eslint-disable-next-line camelcase
      event_type: eventType,
      // eslint-disable-next-line camelcase
      user_id: userId,
    };

    const filteredRows =
      Object
        .entries(row)
        .filter(([ _, v ]) => null !== v && v !== undefined)
    ;

    const keys = filteredRows.map(([ k ]) => k);
    const queryValues = filteredRows.map((_, i) => `$${ i + 1 }`);
    const values = filteredRows.map(([ _, v ]) => v);

    return {
      text: `
        insert into event_reservations
          (${ keys.join(", ") })
        values
          (${ queryValues.join(", ") })
        returning
          *
      `,
      values: [
        ...values,
      ],
    };
  }
;

export const queryReservationsUpdateStatusByEventIdAndUserId =
  (
    {
      eventId,
      eventType,
      userId,
    }: Pick<Data, "eventType" | "eventId" | "userId">,
    {
      status,
    }: Pick<Data, "status">,
  ): Query => ({
    text: `
      update
        event_reservations
      set
          "updated_at" = CURRENT_TIMESTAMP
        , "status" = $4
      where
            event_id = $1
        and  user_id = $2
        and event_type = $3
      returning
        *
    `,
    values: [
      eventId,
      userId,
      eventType,

      status,
    ],
  })
;

export const queryReservationsDeleteByEventId =
  (
    {
      eventType,
      eventId,
    }: Pick<Data, "eventType" | "eventId">,
  ): Query => ({
    text: `
      delete from
        event_reservations
      where
            event_id = $1
        and event_type = $2
      returning id
    `,
    values: [
      eventId,
      eventType,
    ],
  })
;
