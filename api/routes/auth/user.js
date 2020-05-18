import {
  Router,
} from "express";
import {
  ApiError,
  apiRoute,
} from "../../helpers/route";
import {
  post,
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
    const { data } = await post(
      process.env.JOBFAIR_GRAPHQL_ENDPOINT,
      currentUserQuery(),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: req.authHeader,
        },
      },
    );

    return data.current_user;
  } catch (e) {
    throw new ApiError("something-went-wrong");
  }
}));

export default router;
