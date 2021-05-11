import {
  Router,
} from "express";
import isLive from "../../helpers/health";
import {
  ApiError,
  apiRoute,
} from "../../helpers/route";
import {
  graphQlQuery,
} from "../../helpers/axios";
import {
  loginMutation,
} from "../../graphql/mutations";

const router = Router();

router.post("/", apiRoute(async (req) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError("no-credentials-provided");
  }

  if (!isLive()) {
    throw new ApiError("application-offline");
  }

  try {
    const data = await graphQlQuery(loginMutation({ email, password })) || {};

    return data.login || null;
  } catch (e) {
    throw new ApiError("something-went-wrong");
  }
}));

export default router;
