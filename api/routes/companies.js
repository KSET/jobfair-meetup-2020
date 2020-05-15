import {
  Router,
} from "express";
import {
  apiRoute,
} from "../helpers";

const router = Router();

router.get("/participants", apiRoute(() => {
  return (
    Array(5 * 8)
      .fill(0)
      .map(
        (_, i) =>
          ({
            id: i + 1,
            image: "/404.svg",
            description: `Sudionik ${ i + 1 }`,
          })
        ,
      )
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
