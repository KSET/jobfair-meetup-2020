import type {
  CamelCasedPropertiesDeep,
  SetOptional,
} from "type-fest";
import {
  User,
} from "../../api/graphql/types";
import {
  EventType,
} from "../../components/student/event-status";
import {
  Query,
} from "../methods";
import {
  generateInsertQuery,
} from "../query";

/* eslint-disable camelcase */

export interface EventLogEntry {
  user_id: User["id"];
  event_id: number;
  event_type: EventType;
  scanner_id: User["id"];
  scanned_at: string;
}

/* eslint-enable camelcase */

type Data = CamelCasedPropertiesDeep<EventLogEntry>;

export const queryEventLogEntriesGetByUserAndEvent =
  (
    {
      userId,
      eventId,
      eventType,
    }: Pick<Data, "userId" | "eventId" | "eventType">,
  ): Query => ({
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
    }: Pick<Data, "eventId" | "eventType">,
  ): Query => ({
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
  (): Query => ({
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
      scannedAt,
    }: SetOptional<Data, "scannedAt">,
  ): Query => generateInsertQuery({
    table: "event_log_entries",
    data: {
      userId,
      eventId,
      eventType,
      scannerId,
      scannedAt,
    },
  })
;
