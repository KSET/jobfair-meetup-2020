import {
  Router,
} from "express";
import {
  participantsQuery,
} from "../graphql/queries";
import {
  apiRoute,
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
