import {
 EventType,
} from "../../../components/student/event-status";
import {
  queryEventLogEntriesCreate,
  queryEventLogEntriesGetAll,
  queryEventLogEntriesGetByEvent,
} from "../../../db/helpers/eventLogEntries";
import {
  Client,
} from "../../../db/methods";
import {
  dotGet,
} from "../../../helpers/data";
import {
  keysFromSnakeToCamelCase,
} from "../../../helpers/object";
import {
  sendCsv,
} from "../../helpers/csv";
import {
  HttpStatus,
  internalRequest,
} from "../../helpers/http";
import {
  requireAuth,
} from "../../helpers/middleware";
import {
  RoleNames,
} from "../../helpers/permissions";
import {
  ApiError,
  AuthRouter,
  Router,
} from "../../helpers/route";
import {
  requireGateGuardian,
} from "./_helpers";

const router = new Router();

router.post("/", requireAuth({ fullUserData: true }), requireGateGuardian, async ({ body, authUser }) => {
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

router.get("//:eventType/-?:eventId(\\d+)", requireAuth({ fullUserData: true }), requireGateGuardian, async ({ params }) => {
  const {
    eventId: eventIdRaw,
    eventType,
  } = params;
  const eventId =
    "networking" !== eventType
    ? eventIdRaw
    : Number(eventIdRaw) * -1
  ;

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

  const logEntries = await Client.queryOnce(queryEventLogEntriesGetByEvent({ eventId, eventType })) as any;

  for (const { user_id: userId } of logEntries) {
    userIds.add(userId);
  }

  return Array.from(userIds);
});

router.post("//manual", requireAuth({ fullUserData: true }), requireGateGuardian, async ({ body, authUser }) => {
  const {
    userId,
    eventId,
    eventType,
    eventDate,
  } = body;

  if (!userId || !eventId || !eventType || !eventDate) {
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
    scannedAt: new Date(eventDate),
  };

  const data = await Client.queryOneOnce(queryEventLogEntriesCreate(payload));

  return keysFromSnakeToCamelCase(data);
});

const moderatorRouter = AuthRouter.boundToRouter(router, {
  role: RoleNames.MODERATOR,
});

moderatorRouter.get("//all", async () => {
  const list = await Client.queryOnce(queryEventLogEntriesGetAll());

  return keysFromSnakeToCamelCase(list);
});

moderatorRouter.get("//for-event/:eventType/:eventId(\\d+)", async ({ params }) => {
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

  sendCsv(
    res,
    {
      fileName: `${ fileName } - ${ Date.now() } - sudionici.csv`,
      headers,
      rows,
    },
  );
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

moderatorRouter.getRaw("//export/all.csv", async ({ authHeader }, res) => {
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

  const typeTransformer = (key: string): EventType => {
    switch (key) {
      case "presentations":
        return EventType.talk;
      case "workshops":
        return EventType.workshop;
      default:
        return key.replace(/s$/, "") as EventType;
    }
  };

  const companies = Object.fromEntries(rawCompanies.map((c) => [ c.id, c ]));

  const eventList =
    Object
      .entries(rawEventList)
      .map(([ type, eventList ]) =>
          (eventList as any[])
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

moderatorRouter.getRaw("//export/:eventType/:eventId(\\d+).csv", async ({ authHeader, params }, res) => {
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
