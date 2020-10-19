import {
  fixCompany,
} from "../../helpers/company";
import {
  keysFromSnakeToCamelCase,
} from "../../helpers/object";
import {
  cachedFetcher,
} from "../helpers/fetchCache";
import {
  HttpStatus,
  internalRequest,
} from "../helpers/http";
import {
  participantsQuery,
  participantEventsQuery,
} from "../graphql/queries";
import {
  ApiError,
  Router,
} from "../helpers/route";
import {
  graphQlQuery,
} from "../helpers/axios";

const router = new Router();

const cacheForMs = 15 * 1000;

router.get("/participants", cachedFetcher(cacheForMs, async () => {
  const { companies } = await graphQlQuery(participantsQuery());

  if (!companies) {
    return [];
  }

  return companies.map(fixCompany);
}));

router.get("/events/all", cachedFetcher(cacheForMs, async () => {
  const { companies, ...eventList } = await graphQlQuery(participantEventsQuery());

  const { data: panels } = await internalRequest("get", "/panels/list/with-info");

  const events = {
    panels,
    ...eventList,
  };

  return keysFromSnakeToCamelCase({
    companies: companies.map(fixCompany),
    ...events,
  });
}));

router.get("/events", cachedFetcher(cacheForMs, async () => {
  const { data } = await internalRequest("get", "/companies/events/all");
  const { companies, ...events } = data;

  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  const eventHasNotPassed =
    (
      {
        date,
        occuresAt,
        occures_at: occuresAtOther,
      },
    ) =>
      new Date(date || occuresAt || occuresAtOther) >= oneHourAgo
  ;

  const removePassedEvents =
    (
      [
        key,
        events,
      ],
    ) =>
      [
        key,
        events.filter(eventHasNotPassed),
      ]
  ;

  const filteredEvents = Object.fromEntries(
    Object
      .entries(events)
      .map(removePassedEvents)
    ,
  );

  return {
    companies,
    ...filteredEvents,
  };
}));

router.get("/events/panel/:id", cachedFetcher(cacheForMs, async ({ params }) => {
  const { id } = params;
  const { data: panel } = await internalRequest("get", `/panels/full-info/${ id }`);

  return {
    ...panel,
    occuresAt: panel.date,
  };
}, ({ params }) => {
  return params.id;
}));

router.get("/events/:type/:id", cachedFetcher(cacheForMs, async ({ params }) => {
  const { type, id } = params;

  if (!type || !id) {
    throw new ApiError("no-params", HttpStatus.Error.Forbidden, [
      "Type and ID are required params",
    ]);
  }

  const typeTransformer = (type) => {
    switch (type) {
      case "presentation":
      case "talk":
        return "presentations";
      case "workshop":
        return "workshops";
      default:
        return `${ type }s`;
    }
  };

  const transformedType = typeTransformer(type);

  const { companies, [transformedType]: objList } = await graphQlQuery(participantEventsQuery());

  if (!objList) {
    throw new ApiError("no-type", HttpStatus.Error.Forbidden, [
      `Event type not found: ${ transformedType }`,
    ]);
  }

  const obj = objList.find(({ id: i }) => Number(i) === Number(id));

  if (!obj) {
    throw new ApiError("event-not-found", HttpStatus.Error.Client.NotFound, [
      "Event not found",
    ]);
  }

  return keysFromSnakeToCamelCase({
    ...obj,
    company: fixCompany(companies.find(({ id }) => id === obj.company.id)),
  });
}, ({ params }) => {
  const { type, id } = params;

  return `${ type }::${ id }`;
}));

router.get("/info/:id", cachedFetcher(cacheForMs, async ({ params }) => {
  const { data } = await internalRequest("GET", "/companies/events/all") || {};
  const { companies, ...rawEvents } = data;

  const company = companies.find(({ id }) => String(id) === String(params.id));

  if (!company) {
    throw new ApiError("Company not found", HttpStatus.Error.Client.NotFound);
  }

  const newType = (key) => {
    switch (key) {
      case "presentations":
        return "talk";
      case "workshops":
        return "workshop";
      default:
        return key.replace(/s$/, "");
    }
  };

  const events =
    Object
      .entries(rawEvents)
      .flatMap(
        ([ type, events ]) =>
          events.map(
            (event) =>
              Object.assign(
                event,
                {
                  type: newType(type),
                  title: event.title || event.name,
                  topic: event.topic || "Workshop",
                },
              ),
          ),
      )
      .filter(({ company, companies }) => {
        if (String(company.id) === String(params.id)) {
          return true;
        }

        if (!companies) {
          return false;
        }

        return companies.find(({ info }) => String(info.id) === String(params.id));
      })
  ;

  return { ...company, events };
}, ({ params }) => {
  return params.id;
}));

export default router;
