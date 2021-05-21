import {
  EventType,
} from "../../../components/student/event-status";
import {
  dotGet,
} from "../../../helpers/data";
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
import CompanyEventsService from "../../services/company-events-service";
import type {
  Company,
} from "../../services/company-service";
import EntryLogService from "../../services/entry-log-service";
import type {
  EventLogEntry,
} from "../../services/entry-log-service";
import ResumeService from "../../services/resume-service";
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

  return await EntryLogService.create(payload);
});

router.get("/:eventType/-?:eventId(\\d+)", requireAuth({ fullUserData: true }), requireGateGuardian, async ({ params }) => {
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

  const userIds = new Set<EventLogEntry["userId"]>();

  const logEntries = await EntryLogService.forEvent(eventId, eventType);

  for (const { userId } of logEntries) {
    userIds.add(userId);
  }

  return Array.from(userIds);
});

router.post("/manual", requireAuth({ fullUserData: true }), requireGateGuardian, async ({ body, authUser }) => {
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
    scannedAt: eventDate,
  };

  return await EntryLogService.create(payload);
});

const moderatorRouter = AuthRouter.boundToRouter(router, {
  role: RoleNames.MODERATOR,
});

moderatorRouter.get("/all", async () => {
  return await EntryLogService.list();
});

moderatorRouter.get("/for-event/:eventType/:eventId(\\d+)", async ({ params }) => {
  return await EntryLogService.forEvent(params.eventId, params.eventType);
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

moderatorRouter.getRaw("/export/all.csv", async ({ authHeader }, res) => {
  const [
    scanned,
    { companies: rawCompanies, ...rawEventList },
    resumes,
  ] = await Promise.all([
    EntryLogService.list(),
    CompanyEventsService.listAll(),
    ResumeService.list(authHeader),
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

  const companies: Record<Company["id"], Company> = Object.fromEntries(rawCompanies.map((c) => [ c.id, c ]));

  const eventList =
    Object
      .entries(rawEventList)
      .map(([ type, eventList ]) =>
          (eventList)
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

moderatorRouter.getRaw("/export/:eventType/:eventId(\\d+).csv", async ({ authHeader, params }, res) => {
  const { eventType, eventId } = params;
  const auth = {
    headers: {
      Authorization: authHeader,
    },
  };

  const [
    { data: scanned },
    event,
    resumes,
  ] = await Promise.all([
    internalRequest("get", `/events/entry-log/for-event/${ eventType }/${ eventId }`, auth),
    CompanyEventsService.listEventOfTypeForCompany(eventId, eventType),
    ResumeService.list(authHeader),
  ]);

  if (
    !event ||
    !("title" in event) ||
    !("name" in event.company) ||
    !("type" in event)
  ) {
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
