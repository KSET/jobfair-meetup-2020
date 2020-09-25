import {
  keysFromSnakeToCamelCase,
  pipe,
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

const fixCompanyKeys =
  ({
     name,
     brandName,
     shortDescription: description,
     logo,
     ...rest
   }) =>
    ({
      name: brandName || name,
      legalName: name,
      brandName,
      description,
      image: logo && logo.original.url,
      thumbnail: logo && logo.small && logo.small.url,
      images: logo,
      ...rest,
    })
;

const fixCompany =
  pipe(
    keysFromSnakeToCamelCase,
    fixCompanyKeys,
  )
;

const cacheForMs = 10 * 1000;

router.get("/participants", cachedFetcher(cacheForMs, async () => {
  const { companies } = await graphQlQuery(participantsQuery());

  if (!companies) {
    return [];
  }

  return companies.map(fixCompany);
}));

router.get("/events", cachedFetcher(cacheForMs, async () => {
  const { companies, ...events } = await graphQlQuery(participantEventsQuery());

  return keysFromSnakeToCamelCase({
    companies: companies.map(fixCompany),
    ...events,
  });
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
  const { data: companies = [] } = await internalRequest("GET", "/companies/participants") || {};

  const company = companies.find(({ id }) => String(id) === String(params.id));

  if (!company) {
    throw new ApiError("Company not found", HttpStatus.Error.Client.NotFound);
  }

  return company;
}, ({ params }) => {
  return params.id;
}));

export default router;
