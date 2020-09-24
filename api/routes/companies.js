import {
  cachedFetcher,
} from "../helpers/fetchCache";
import {
  HttpStatus,
} from "../helpers/http";
import {
  participantsQuery,
  participantEventsQuery,
  companyQuery,
} from "../graphql/queries";
import {
  ApiError,
  Router,
} from "../helpers/route";
import {
  graphQlQuery,
} from "../helpers/axios";

const router = new Router();

const fixCompany =
  ({
     id,
     short_description: description,
     homepage_url: homepageUrl,
     logo,
     ...rest
   }) =>
    ({
      id,
      description,
      image: logo && logo.original.url,
      images: logo,
      homepageUrl,
      ...rest,
    })
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
  return await graphQlQuery(participantEventsQuery());
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

  return {
    ...obj,
    company: companies.find(({ id }) => id === obj.company.id),
  };
}, ({ params }) => {
  const { type, id } = params;

  return `${ type }::${ id }`;
}));

router.get("/info/:id", cachedFetcher(cacheForMs, async ({ params, authHeader }) => {
  const { id } = params;
  const { company } = await graphQlQuery(companyQuery(Number(id)), authHeader);

  return fixCompany(company);
}, ({ params }) => {
  return params.id;
}));

export default router;
