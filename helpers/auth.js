import {
  isModerator,
} from "../api/helpers/permissions";
import {
  dotGet,
} from "./data";

export const isGateGuardian =
  (user) =>
    isModerator(dotGet(user, "role")) ||
    dotGet(user, "companies", []).find(({ id }) => 428 === Number(id))
;
