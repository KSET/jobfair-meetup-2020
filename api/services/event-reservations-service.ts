import _ from "lodash/fp";
import type {
 CamelCasedPropertiesDeep,
} from "type-fest";
import type {
 EventStatusType,
} from "../../components/student/event-status";
import {
  eventListFromStatus,
  EventType,
} from "../../components/student/event-status";
import type {
  EventReservation,
  EventReservationGroup,
} from "../../db/helpers/reservations";
import {
  queryReservationsGetByUserId,
  queryReservationsListUserIdsByEvent,
} from "../../db/helpers/reservations";
import {
 Client,
} from "../../db/methods";
import {
 keysFromSnakeToCamelCase,
} from "../../helpers/object";
import type {
 User,
} from "../graphql/types";
import type {
  FixedEvent,
} from "./company-events-service";
import {
 ServiceError,
} from "./error-service";
import type {
 BasicResumeInfo,
} from "./resume-service";
import ResumeService from "./resume-service";

export class EventReservationsServiceError extends ServiceError {
}

export type Events = Record<EventReservation["event_type"], Record<EventReservation["event_id"], Record<keyof EventStatusType, string[]>>>;

export interface EventList {
  events: Events;
  users: Record<BasicResumeInfo["userId"], BasicResumeInfo>;
}

export type Event = Pick<CamelCasedPropertiesDeep<EventReservation>, "eventId" | "eventType" | "status">;

export interface FormattedEvent {
  id: FixedEvent["id"];
  title: FixedEvent["title"];
  company: FixedEvent["company"]["name"];
  users: {
    name: BasicResumeInfo["fullName"];
    email: BasicResumeInfo["email"];
  }[];
}

export default class EventReservationsService {
  static async listAll(authHeader: string): Promise<EventList> {
    const [
      rawResumes,
      rawEvents,
    ] = await Promise.all([
      ResumeService.list(authHeader),
      Client.queryOnce<EventReservationGroup>(queryReservationsListUserIdsByEvent()),
    ]);

    const resumes: Record<string, BasicResumeInfo> =
      _.flow(
        _.map((resume: BasicResumeInfo) => [ resume.userId, resume ]),
        _.fromPairs,
      )(rawResumes)
    ;

    if (!rawEvents) {
      throw new EventReservationsServiceError(
        "Could not fetch reservations",
      );
    }

    const userList = new Set();
    const events: Events =
      rawEvents
        .map(keysFromSnakeToCamelCase)
        .reduce(
          (acc, event) => {
            const {
              eventType,
              eventId,
              status,
              userIds,
            } = event;

            if (!(eventType in acc)) {
              acc[eventType] = {};
            }

            if (!(eventId in acc[eventType])) {
              acc[eventType][eventId] = Object.fromEntries(eventListFromStatus(-1).map((type) => [ type, [] ]));
            }

            for (const type of eventListFromStatus(status)) {
              for (const id of userIds.split(",")) {
                userList.add(id);
                acc[eventType][eventId][type].push(id);
              }
            }

            return acc;
          },
          {} as Events,
        )
    ;

    const users: EventList["users"] =
      _.flow(
        Array.from,
        _.map((id) => [ id, resumes[id] ]),
        _.fromPairs,
      )(userList)
    ;

    return {
      events,
      users,
    };
  }

  static async forUser(userId: User["id"]): Promise<Record<EventType, Omit<Event, "eventType">[]>> {
    const rawEvents = await Client.queryOnce<EventReservation>(queryReservationsGetByUserId({
      userId,
    }));

    if (!rawEvents) {
      throw new EventReservationsServiceError(
        "Could not fetch reservations for user",
      );
    }

    const fixEvent: (rawEvent: EventReservation) => Event =
      _.flow(
        keysFromSnakeToCamelCase,
        _.pick([ "eventId", "eventType", "status" ]),
      )
    ;

    return (
      rawEvents
        .map(fixEvent)
        .reduce(
          (acc, { eventType, ...el }) => {
            if (!(eventType in acc)) {
              acc[eventType] = [];
            }

            acc[eventType].push(el);

            return acc;
          },
          {} as Record<EventType, Omit<Event, "eventType">[]>,
        )
    );
  }
}
