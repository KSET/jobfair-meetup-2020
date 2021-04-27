import {
  eventListFromStatus,
  hasParticipantCapacityFor,
} from "../../../components/student/event-status";
import {
  queryReservationsCountVisitorsForEvent,
  queryReservationsCreate,
  queryReservationsGetByEventAndUserId,
  queryReservationsUpdateStatusByEventIdAndUserId,
} from "../../../db/helpers/reservations";
import {
  Client,
} from "../../../db/methods";
import {
  HttpStatus,
} from "../../helpers/http";
import {
  ApiError,
  Router,
} from "../../helpers/route";
import CompanyEventsService from "../../services/company-events-service";
import type {
  Event,
} from "../../services/company-events-service";
import {
  requireCv,
} from "./_helpers";

const router = new Router();

router.use(requireCv);

router.post("/", async ({ body, authUser }) => {
  const {
    id: rawId,
    type: rawEventType,
    status: rawStatus,
  } = body;

  const id = String(rawId);
  const status = Number(rawStatus);
  const eventType = String(rawEventType);

  if (!id || isNaN(status) || !eventType) {
    throw new ApiError("Data missing", HttpStatus.Error.Client.UnprocessableEntity);
  }

  const eventInfo = await CompanyEventsService.listAll();

  let events: Event[] = [];
  switch (eventType) {
    case "workshop":
      events = eventInfo.workshops;
      break;
    case "talk":
      events = eventInfo.presentations;
      break;
    case "panel":
      events = eventInfo.panels;
      break;
  }

  const event = events.find((event) => String(event.id) === String(id));

  if (!event) {
    throw new ApiError(
      "Event not found",
      HttpStatus.Error.Client.NotFound,
    );
  }

  const key = {
    userId: authUser.id,
    eventId: id,
    eventType,
    status,
  };

  return await Client.transaction(async (client) => {
    const eventReservation = await client.queryOne(queryReservationsGetByEventAndUserId(key)) as any;
    const rawParticipants = await client.query(queryReservationsCountVisitorsForEvent(key)) as any[];
    const participants = {};

    for (const { status, count } of rawParticipants) {
      for (const selected of eventListFromStatus(status)) {
        if (!(selected in participants)) {
          participants[selected] = 0;
        }

        participants[selected] += Number(count);
      }
    }

    if (eventReservation) {
      // eslint-disable-next-line no-bitwise
      const statusAdded = (eventReservation.status ^ status) & status;
      const newProps = eventListFromStatus(statusAdded);

      for (const prop of newProps) {
        if (!hasParticipantCapacityFor(eventType, participants[prop])) {
          throw new ApiError("Too many participants");
        }
      }

      await client.queryOne(queryReservationsUpdateStatusByEventIdAndUserId(key, { status }));
    } else {
      await client.queryOne(queryReservationsCreate({ ...key, status }));
    }

    return { ...key, status };
  });
});

export default router;
