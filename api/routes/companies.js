import {
  Router,
} from "express";
import {
  participantsQuery,
  participantEventsQuery,
} from "../graphql/queries";
import {
  apiRoute,
  ApiError,
} from "../helpers/route";
import {
  graphQlQuery,
} from "../helpers/axios";

const router = Router();

router.get("/participants", apiRoute(async () => {
  const { companies } = await graphQlQuery(participantsQuery());

  if (!companies) {
    return [];
  }

  return companies.map(
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
        image: logo.original.url,
        images: logo,
        homepageUrl,
        ...rest,
      })
    ,
  );
}));

router.get("/events", apiRoute(async () => {
  return await graphQlQuery(participantEventsQuery());
}));

router.get("/events/:type/:id", apiRoute(async ({ params }) => {
  const { type, id } = params;

  if (!type || !id) {
    throw new ApiError("no-params", 403, [
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
    throw new ApiError("no-type", 403, [
      `Event type not found: ${ transformedType }`,
    ]);
  }

  const obj = objList.find(({ id: i }) => Number(i) === Number(id));

  if (!obj) {
    throw new ApiError("event-not-found", 404, [
      "Event not found",
    ]);
  }

  return {
    ...obj,
    company: companies.find(({ id }) => id === obj.company.id),
  };
}));

router.get("/project-friends", apiRoute(() => {
  return (
    Array(5 * 2)
      .fill(0)
      .map(
        (_, i) =>
          ({
            id: i + 1,
            image: "/404.svg",
            description: `Prijatelj projekta ${ i + 1 }`,
          })
        ,
      )
  );
}));

export default router;
