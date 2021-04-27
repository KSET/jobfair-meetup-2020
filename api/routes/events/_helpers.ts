import {
  isGateGuardian,
} from "../../../helpers/auth";
import {
  HttpStatus,
} from "../../helpers/http";
import {
  error,
} from "../../helpers/route";

export const requireCv =
  ({ authUser }, res, next) => {
    if (authUser?.uid) {
      return next();
    }

    const status: number = HttpStatus.Error.Client.NotAcceptable;

    res.status(status);

    return res.json(error({
      reason: "No CV submitted",
      status,
    }));
  }
;

export const requireGateGuardian =
  ({ authUser }, res, next) => {
    if (isGateGuardian(authUser)) {
      return next();
    }

    const status = HttpStatus.Error.Client.NotAcceptable;

    res.status(status);

    return res.json(error({
      reason: "Not gate guardian",
      status,
    }));
  }
;
