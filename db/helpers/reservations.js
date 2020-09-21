export const queryReservationsGetByEventId =
  ({
     eventId,
   }) => ({
    text: `
      select
        *
      from
        event_reservations
      where
            event_id = $1
        and  status <> 0
    `,
    values: [
      eventId,
    ],
  })
;

export const queryReservationsCountVisitorsByEvent =
  () => ({
    text: `
      select
        event_id, status, count(status)
      from
        event_reservations
      where
        status <> 0
      group by
        event_id, status
    `,
    values: [],
  })
;

export const queryReservationsCountVisitorsForEvent =
  ({ eventId }) => ({
    text: `
      select
        event_id, status, count(status)
      from
        event_reservations
      where
             status <> 0
        and event_id = $1
      group by
        event_id, status
    `,
    values: [
      eventId,
    ],
  })
;

export const queryReservationsGetByUserId =
  ({
     userId,
   }) => ({
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
  ({
     eventId,
     userId,
   }) => ({
    text: `
      select
        *
      from
        event_reservations
      where
            event_id = $1
        and  user_id = $2
    `,
    values: [
      eventId,
      userId,
    ],
  })
;

export const queryReservationsCreate =
  ({
     eventId,
     userId,
     status,
   }) => {
    const row = {
      status,
      // eslint-disable-next-line camelcase
      event_id: eventId,
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
      userId,
    },
    {
      status,
    },
  ) => ({
    text: `
      update
        event_reservations
      set
          "updated_at" = CURRENT_TIMESTAMP
        , "status" = $3
      where
            event_id = $1
        and  user_id = $2
      returning
        *
    `,
    values: [
      eventId,
      userId,

      status,
    ],
  })
;
