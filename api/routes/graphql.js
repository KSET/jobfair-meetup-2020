import {
  Router,
} from "express";
import {
  graphQlQuery,
} from "../helpers/axios";
import {
  injectAuthData,
} from "../helpers/middleware";
import {
  ApiError,
  apiRoute,
} from "../helpers/route";

const router = Router();

router.post("/proxy", injectAuthData(), apiRoute((req) => {
  if (!req.body.query) {
    throw new ApiError("no-query");
  }

  return graphQlQuery(req.body, req.authHeader) || {};
}));

export default router;
