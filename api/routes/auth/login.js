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
  loginMutation,
  refreshTokenMutation,
} from "../../graphql/mutations";

const router = Router();

router.post("/", apiRoute(async (req) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError("no-credentials-provided");
  }

  try {
    const { data = {} } = await post(
      process.env.JOBFAIR_GRAPHQL_ENDPOINT,
      loginMutation({ email, password }),
    );

    return data.login || null;
  } catch (e) {
    throw new ApiError("something-went-wrong");
  }
}));

router.post("/refresh", apiRoute(async (req) => {
  const { token, refreshToken } = req.body;

  try {
    const { data = {} } = await post(
      process.env.JOBFAIR_GRAPHQL_ENDPOINT,
      refreshTokenMutation({ token, refreshToken }),
    );

    return data.refresh_token || null;
  } catch (e) {
    throw new ApiError("something-went-wrong");
  }
}));

export default router;
