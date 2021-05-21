import type {
  CamelCasedPropertiesDeep,
  SetOptional,
} from "type-fest";
import {
  queryEventLogEntriesCreate,
  queryEventLogEntriesGetAll,
  queryEventLogEntriesGetByEvent,
} from "../../db/helpers/eventLogEntries";
import type {
  EventLogEntry as DbEventLogEntry,
} from "../../db/helpers/eventLogEntries";
import {
  Client,
} from "../../db/methods";
import {
  keysFromSnakeToCamelCase,
} from "../../helpers/object";

export type EventLogEntry = SetOptional<CamelCasedPropertiesDeep<DbEventLogEntry>, "scannedAt">;

export default class EntryLogService {
  public static async create(entry: EventLogEntry): Promise<EventLogEntry | null> {
    const data = await Client.queryOneOnce<DbEventLogEntry>(queryEventLogEntriesCreate(entry));

    return keysFromSnakeToCamelCase(data);
  }

  public static async list(): Promise<EventLogEntry[]> {
    const list = await Client.queryOnce<DbEventLogEntry>(queryEventLogEntriesGetAll());

    if (!list) {
      return [];
    }

    return keysFromSnakeToCamelCase(list);
  }

  public static async forEvent(eventId: EventLogEntry["eventId"], eventType: EventLogEntry["eventType"]): Promise<EventLogEntry[]> {
    const list = await Client.queryOnce<DbEventLogEntry>(queryEventLogEntriesGetByEvent({
      eventId,
      eventType,
    }));

    if (!list) {
      return [];
    }

    return keysFromSnakeToCamelCase(list);
  }
}
