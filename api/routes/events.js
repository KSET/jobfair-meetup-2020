import {
  eventListFromStatus,
  EventStatus,
  hasParticipantCapacityFor,
} from "../../components/student/event-status";
import {
  queryEventLogEntriesCreate,
  queryEventLogEntriesGetByEvent,
} from "../../db/helpers/eventLogEntries";
import {
  queryReservationsCountVisitorsForEvent,
  queryReservationsCountVisitorsByEvent,
  queryReservationsCreate,
  queryReservationsGetByEventAndUserId,
  queryReservationsGetByEventId,
  queryReservationsGetByUserId,
  queryReservationsUpdateStatusByEventIdAndUserId,
  queryReservationsListUserIdsByEvent,
} from "../../db/helpers/reservations";

import {
  Client,
} from "../../db/methods";
import {
  keysFromSnakeToCamelCase,
  pickKeys,
  pipe,
} from "../../helpers/object";
import {
  HttpStatus,
  internalRequest,
} from "../helpers/http";
import {
  RoleNames,
} from "../helpers/permissions";
import {
  error,
  ApiError,
  AuthRouter,
} from "../helpers/route";
import {
  cachedFetcher,
} from "../helpers/fetchCache";
import {
  requireAuth,
} from "../helpers/middleware";


const router = new AuthRouter({
  role: RoleNames.BASE,
});

const requireCv =
  (req, res, next) => {
    const { authUser } = req;
    const { uid } = authUser;

    if (!uid) {
      const status = HttpStatus.Error.Client.NotAcceptable;

      res.status(status);

      return res.json(error({
        reason: "No CV submitted",
        status,
      }));
    }

    return next();
  }
;

const requireGateGuardian =
  (req, res, next) => {
    const { authUser } = req;
    const { companies } = authUser;

    if (!companies || !companies.find(({ id }) => 428 === Number(id))) {
      const status = HttpStatus.Error.Client.NotAcceptable;

      res.status(status);

      return res.json(error({
        reason: "Not gate guardian",
        status,
      }));
    }

    return next();
  }
;

router.post("/status", requireCv, async ({ body, authUser }) => {
  const { id: rawId, type: rawEventType, status: rawStatus } = body;
  const id = String(rawId);
  const status = Number(rawStatus);
  const eventType = String(rawEventType);

  if (!id || isNaN(status) || !eventType) {
    throw new ApiError("Data missing", HttpStatus.Error.Client.UnprocessableEntity);
  }

  const { data } = await internalRequest(
    "get",
    "/companies/events",
  );

  let events = [];
  switch (eventType) {
    case "workshop":
      events = data.workshops;
      break;
    case "talk":
      events = data.presentations;
      break;
    case "panel":
      events = data.panels;
      break;
  }

  const event = events.find((event) => String(event.id) === String(id));

  if (!event) {
    throw new ApiError("Event not found", HttpStatus.Error.Client.NotFound);
  }

  const client = new Client();

  try {
    await client.connect();
    await client.startTransaction();
    const key = { userId: authUser.id, eventId: id, eventType };

    const eventReservation = await client.queryOne(queryReservationsGetByEventAndUserId(key));
    const rawParticipants = await client.query(queryReservationsCountVisitorsForEvent(key));
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

    await client.commit();

    return { ...key, status };
  } catch (e) {
    await client.rollback();

    if (e instanceof ApiError) {
      throw e;
    }

    console.log("|> EVENT REGISTER ERROR", e);

    throw new ApiError("Something went wrong");
  } finally {
    await client.end();
  }
});

router.get("/mine", requireCv, async ({ authUser }) => {
  const rawEvents = await Client.queryOnce(queryReservationsGetByUserId({ userId: authUser.id }));

  const fixEvent =
    pipe(
      keysFromSnakeToCamelCase,
      pickKeys.bind(null, [ "eventId", "eventType", "status" ]),
    )
  ;

  return rawEvents.map(fixEvent).reduce((acc, { eventType, ...el }) => {
    if (!(eventType in acc)) {
      acc[eventType] = [];
    }

    acc[eventType].push(el);

    return acc;
  }, {});
});

router.get("/participants", requireCv, async () => {
  const rawEvents = await Client.queryOnce(queryReservationsCountVisitorsByEvent());
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

router.get("/participants/is-participant/:eventType/:eventId/:userId", requireAuth({ fullUserData: true }), requireGateGuardian, async ({ params }) => {
  const { eventType, eventId, userId } = params;

  const reservation = await Client.queryOneOnce(queryReservationsGetByEventAndUserId({
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

router.post("/entry-log", requireAuth({ fullUserData: true }), requireGateGuardian, async ({ body, authUser }) => {
  const {
    userId,
    eventId,
    eventType,
  } = body;

  if (!userId || !eventId || !eventType) {
    throw new ApiError(
      "Not all data provided",
      HttpStatus.Error.Client.UnprocessableEntity,
      {
        userId,
        eventId,
        eventType,
      },
    );
  }

  const payload = {
    userId,
    eventId,
    eventType,
    scannerId: authUser.id,
  };

  const data = await Client.queryOneOnce(queryEventLogEntriesCreate(payload));

  return keysFromSnakeToCamelCase(data);
});

router.get("/entry-log/:eventType/:eventId", requireAuth({ fullUserData: true }), requireGateGuardian, async ({ params }) => {
  const {
    eventId,
    eventType,
  } = params;

  if (!eventId || !eventType) {
    throw new ApiError(
      "Not all data provided",
      HttpStatus.Error.Client.UnprocessableEntity,
      {
        eventId,
        eventType,
      },
    );
  }

  const userIds = new Set();

  const logEntries = await Client.queryOnce(queryEventLogEntriesGetByEvent({ eventId, eventType }));

  for (const { user_id: userId } of logEntries) {
    userIds.add(userId);
  }

  return Array.from(userIds);
});

router.get("/participants/:eventType/:eventId", async ({ params }) => {
  const { eventType, eventId } = params;

  const rawEvents = await Client.queryOnce(queryReservationsGetByEventId({ eventType, eventId }));
  const events = Object.fromEntries(Object.keys(EventStatus).map((k) => [ k, 0 ]));

  for (const { status } of rawEvents) {
    for (const selected of eventListFromStatus(status)) {
      events[selected] += 1;
    }
  }

  return events;
});

const moderatorRouter = AuthRouter.boundToRouter(router, {
  role: RoleNames.MODERATOR,
});

const timeoutMs = 1.5 * 1000;

moderatorRouter.get("/users", cachedFetcher(timeoutMs, async ({ authHeader }) => {
  const auth = {
    headers: {
      Authorization: authHeader,
    },
  };

  const resumes = await internalRequest("get", "/resumes/list", auth).then(({ data: resumes }) => Object.fromEntries(resumes.map((resume) => [ resume.userId, resume ])));
  const rawEvents = await Client.queryOnce(queryReservationsListUserIdsByEvent());
  const userList = new Set();

  const events = rawEvents.map(keysFromSnakeToCamelCase).reduce((acc, event) => {
    const { eventType, eventId, status, userIds } = event;

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
  }, {});

  const users =
    Array
      .from(userList)
      .reduce(
        (acc, id) =>
          Object.assign(
            acc,
            {
              [id]: resumes[id],
            },
          )
        ,
        {},
      )
  ;

  return {
    events,
    users,
  };
}));

export default moderatorRouter;
