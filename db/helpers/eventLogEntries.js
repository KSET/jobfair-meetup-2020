import {
  generateInsertQuery,
} from "../query";

export const queryEventLogEntriesGetByUserAndEvent =
  (
    {
      userId,
      eventId,
      eventType,
    },
  ) => ({
    text: `
      select
        *
      from
        event_log_entries
      where
            "user_id" = $1
        and "event_id" = $2
        and "event_type" = $3
    `,
    values: [
      userId,
      eventId,
      eventType,
    ],
  })
;

export const queryEventLogEntriesGetByEvent =
  (
    {
      eventId,
      eventType,
    },
  ) => ({
    text: `
      select
        *
      from
        event_log_entries
      where
            "event_id" = $1
        and "event_type" = $2
      order by
          event_type
        , event_id
    `,
    values: [
      eventId,
      eventType,
    ],
  })
;

export const queryEventLogEntriesGetAll =
  () => ({
    text: `
      select
        *
      from
        event_log_entries
      order by
          event_type
        , event_id
    `,
    values: [],
  })
;

export const queryEventLogEntriesCreate =
  (
    {
      userId,
      eventId,
      eventType,
      scannerId,
    },
  ) => generateInsertQuery({
    table: "event_log_entries",
    data: {
      userId,
      eventId,
      eventType,
      scannerId,
    },
  })
;
