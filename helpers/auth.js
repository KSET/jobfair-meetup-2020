import {
  dotGet,
} from "./data";

export const isGateGuardian =
  (user) =>
    dotGet(
      user,
      "companies",
      [],
    )
      .find(
        ({ id }) =>
          428 === Number(id),
      )
;
