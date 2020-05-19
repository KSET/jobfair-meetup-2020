import {
  Router,
} from "express";
import {
  ApiError,
  apiRoute,
} from "../../helpers/route";
import {
  graphQlQuery,
} from "../../helpers/axios";
import {
  currentUserQuery,
} from "../../graphql/queries";
import {
  requireAuth,
} from "../../helpers/middleware";

const router = Router();

router.get("/", requireAuth, apiRoute(async (req) => {
  try {
    const data = await graphQlQuery(currentUserQuery(), req.authHeader);

    return data.current_user;
  } catch (e) {
    throw new ApiError("something-went-wrong");
  }
}));

export default router;
