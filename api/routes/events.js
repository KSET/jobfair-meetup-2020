import contentDisposition from "content-disposition";
import {
  isGateGuardian,
} from "../../helpers/auth";
import {
  eventListFromStatus,
  EventStatus,
  hasParticipantCapacityFor,
} from "../../components/student/event-status";
import {
  queryEventLogEntriesCreate,
  queryEventLogEntriesGetByEvent,
  queryEventLogEntriesGetAll,
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
import {
  dotGet,
} from "../../helpers/data";


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

    if (!isGateGuardian(authUser)) {
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
    "/companies/events/all",
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

router.get("/participants/is-participant/:eventType/:eventId(\\d+)/:userId(\\d+)", requireAuth({ fullUserData: true }), requireGateGuardian, async ({ params }) => {
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

router.get("/entry-log/:eventType/:eventId(\\d+)", requireAuth({ fullUserData: true }), requireGateGuardian, async ({ params }) => {
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

router.get("/participants/:eventType/:eventId(\\d+)", async ({ params }) => {
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

moderatorRouter.get("/entry-log/all", async () => {
  const list = await Client.queryOnce(queryEventLogEntriesGetAll());

  return keysFromSnakeToCamelCase(list);
});

moderatorRouter.get("/entry-log/for-event/:eventType/:eventId(\\d+)", async ({ params }) => {
  const list = await Client.queryOnce(queryEventLogEntriesGetByEvent(params));

  return keysFromSnakeToCamelCase(list);
});

const csvEventsExport = (res, data, fileName = "Svi") => {
  const headers = [
    "Firma",
    "Event",
    "Ime",
    "Email",
    "Vrijeme ulaska",
  ];
  const rows = data.map((row) => ([
    row.eventCompany,
    row.eventName,
    row.name,
    row.email,
    row.scannedAt,
  ]));

  const escapeCsvValue =
    (str) =>
      String(str)
        .replace("\"", "\"\"")
        .replace("\n", "\t")
  ;

  const encodeRow =
    (entries) =>
      `"${ entries.map(escapeCsvValue).join("\",\"") }"`
  ;

  res.set("Content-Type", "text/csv");
  res.set("Content-Disposition", contentDisposition(`${ fileName } - ${ Date.now() } - sudionici.csv`));
  res.set("Content-Transfer-Encoding", "binary");

  res.write(encodeRow(headers));
  for (const row of rows) {
    res.write("\n");
    res.write(encodeRow(row));
  }
  res.end();
};

const getResume =
  (
    resumes,
    userId,
  ) =>
    resumes
      .find(
        ({ userId: id }) =>
          String(id) === String(userId)
        ,
      )
;

const getEvent =
  (
    events,
    eventType,
    eventId,
  ) =>
    dotGet(events, `${ eventType }.${ eventId }`, {})
;

const formatData =
  (
    events,
    resumes,
    {
      eventId,
      eventType,
      userId,
      scannedAt,
    },
  ) => {
    const event = getEvent(events, eventType, eventId);
    const user = getResume(resumes, userId);
    const data = {
      eventName: event.name,
      eventCompany: event.company,
      name: userId,
      email: "?",
      scannedAt,
    };

    if (!user) {
      return data;
    }

    return Object.assign(
      data,
      {
        name: `${ user.firstName } ${ user.lastName }`,
        email: user.email,
      },
    );
  }
;

const exportEntryLogToCsv = (res, eventList, scanned, resumes, fileName) => {
  const events = {};
  for (const event of eventList) {
    const { type, id } = event;

    if (!(type in events)) {
      events[type] = {};
    }

    events[type][id] = event;
  }

  const eventParts = {};
  for (const { userId, eventId, eventType, scannedAt } of scanned) {
    if (!(eventType in eventParts)) {
      eventParts[eventType] = {};
    }

    if (!(eventId in eventParts[eventType])) {
      eventParts[eventType][eventId] = [];
    }

    eventParts[eventType][eventId].push({ userId, scannedAt });
  }

  const data = scanned.map(formatData.bind(null, events, resumes));

  return csvEventsExport(res, data, fileName);
};

moderatorRouter.getRaw("/entry-log/export/all.csv", async ({ authHeader }, res) => {
  const auth = {
    headers: {
      Authorization: authHeader,
    },
  };

  const [
    { data: scanned },
    { data: { companies: rawCompanies, ...rawEventList } },
    { data: resumes },
  ] = await Promise.all([
    internalRequest("get", "/events/entry-log/all", auth),
    internalRequest("get", "/companies/events/all", auth),
    internalRequest("get", "/resumes/list", auth),
  ]);

  const typeTransformer = (key) => {
    switch (key) {
      case "presentations":
        return "talk";
      case "workshops":
        return "workshop";
      default:
        return key.replace(/s$/, "");
    }
  };

  const companies = Object.fromEntries(rawCompanies.map((c) => [ c.id, c ]));

  const eventList =
    Object
      .entries(rawEventList)
      .map(([ type, eventList ]) =>
          eventList
            .map(
              ({
                 id,
                 title,
                 name,
                 company,
                 companies: cl,
               }) =>
                ({
                  id: Number(id),
                  type: typeTransformer(type),
                  name: title || name,
                  company: dotGet(companies, (company || cl[0]).id, {}).name,
                })
              ,
            )
        ,
      )
      .flat()
  ;

  const fileName = "Svi sudionici";

  return exportEntryLogToCsv(res, eventList, scanned, resumes, fileName);
});

moderatorRouter.getRaw("/entry-log/export/:eventType/:eventId(\\d+).csv", async ({ authHeader, params }, res) => {
  const { eventType, eventId } = params;
  const auth = {
    headers: {
      Authorization: authHeader,
    },
  };

  const [
    { data: scanned },
    { data: event },
    { data: resumes },
  ] = await Promise.all([
    internalRequest("get", `/events/entry-log/for-event/${ eventType }/${ eventId }`, auth),
    internalRequest("get", `/companies/events/${ eventType }/${ eventId }`, auth),
    internalRequest("get", "/resumes/list", auth),
  ]).then((xs) => xs.map((x) => x || {}));

  if (!event) {
    throw new ApiError("Event not found", HttpStatus.Error.Client.NotFound);
  }

  if (!scanned || !resumes) {
    throw new ApiError("Something went wrong");
  }

  const fileName = `[${ event.company.name }] ${ event.title }`;

  const eventList = [
    {
      id: Number(event.id),
      type: event.type,
      name: event.title,
      company: event.company.name,
    },
  ];

  return exportEntryLogToCsv(res, eventList, scanned, resumes, fileName);
});

export default moderatorRouter;
