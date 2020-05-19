import {
  Router,
} from "express";
import {
 injectAuthData,
} from "../helpers/middleware";
import {
  graphQlQuery,
} from "../helpers/axios";
import {
  apiRoute,
  ApiError,
} from "../helpers/route";

const router = Router();

router.get("/proxy", injectAuthData, apiRoute((req) => {
  if (!req.params.query) {
    throw new ApiError("no-query");
  }

  return graphQlQuery(req.params, req.authHeader);
}));

export default router;
