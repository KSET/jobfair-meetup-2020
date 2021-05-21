import {
  eventListFromStatus,
  EventStatus,
  EventType,
} from "../../../components/student/event-status";
import {
  queryReservationsCountVisitorsByEvent,
  queryReservationsGetByEventAndUserId,
  queryReservationsGetByEventId,
  queryReservationsGetByUserId,
} from "../../../db/helpers/reservations";
import {
  Client,
} from "../../../db/methods";
import {
  keysFromSnakeToCamelCase,
} from "../../../helpers/object";
import {
  requireAuth,
} from "../../helpers/middleware";
import {
  Router,
} from "../../helpers/route";
import CompanyEventsService from "../../services/company-events-service";
import {
  requireCv,
  requireGateGuardian,
} from "./_helpers";

const router = new Router();

router.get("/", requireCv, async () => {
  const rawEvents: any = await Client.queryOnce(queryReservationsCountVisitorsByEvent());
  const events = {};

  for (const { event_id: id, event_type: type, status, count } of rawEvents) {
    if (!(type in events)) {
      events[type] = {};
    }

    if (!(id in events[type])) {
      events[type][id] =
        Object.fromEntries(Object.keys(EventStatus).map((k) => [ k, 0 ]))
      ;
    }

    for (const selected of eventListFromStatus(status)) {
      events[type][id][selected] += Number(count);
    }
  }

  return events;
});

router.get("/is-participant/networking/-1/:userId(\\d+)", requireAuth({ fullUserData: true }), requireGateGuardian, async ({ params }) => {
  const { userId } = params;

  const { panels, workshops, presentations } = await CompanyEventsService.listAll() || {};
  const reservations: any = await Client.queryOnce(queryReservationsGetByUserId({
    userId,
  }));

  const eq = (a, b) => String(a) === String(b);
  const getEvent = ({ eventType, eventId }) => {
    switch (eventType) {
      case EventType.panel:
        return panels.find(({ id }) => eq(id, eventId));
      case EventType.workshop:
        return workshops.find(({ id }) => eq(id, eventId));
      case EventType.talk:
        return presentations.find(({ id }) => eq(id, eventId));
      default:
        return null;
    }
  };
  const isToday = (rawDate) => {
    const today = new Date();
    const date = new Date(rawDate);

    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  for (const reservation of keysFromSnakeToCamelCase(reservations)) {
    const event = getEvent(reservation);

    if (!isToday(event?.occuresAt)) {
      continue;
    }

    const isTalk = EventType.talk === reservation.eventType;
    if (!isTalk) {
      return true;
    }

    const hasNetworking = eventListFromStatus(reservation.status).includes("networking");
    if (hasNetworking) {
      return true;
    }
  }

  return false;
});

router.get("/is-participant/:eventType/:eventId(\\d+)/:userId(\\d+)", requireAuth({ fullUserData: true }), requireGateGuardian, async ({ params }) => {
  const { eventType, eventId, userId } = params;

  const reservation: any = await Client.queryOneOnce(queryReservationsGetByEventAndUserId({
    eventType,
    eventId,
    userId,
  }));

  if (!reservation) {
    return false;
  }

  const { status } = reservation;

  return Boolean(status);
});

router.get("/networking/-1", () => {
  return {
    event: "0",
  };
});

router.get("/:eventType/:eventId(\\d+)", async ({ params }) => {
  const { eventType, eventId } = params;

  const rawEvents: any = await Client.queryOnce(queryReservationsGetByEventId({ eventType, eventId }));
  const events = Object.fromEntries(Object.keys(EventStatus).map((k) => [ k, 0 ]));

  for (const { status } of rawEvents) {
    for (const selected of eventListFromStatus(status)) {
      events[selected] += 1;
    }
  }

  return events;
});

export default router;
