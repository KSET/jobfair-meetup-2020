import {
  Router,
} from "express";
import {
  AuthRouter,
} from "../../helpers/middleware";
import {
  ApiError,
  apiRoute,
} from "../../helpers/route";
import {
  graphQlQuery,
} from "../../helpers/axios";
import {
  refreshTokenMutation,
} from "../../graphql/mutations";

const router = Router();

router.post("/refresh", apiRoute(async (req) => {
  const { token, refreshToken } = req.body;

  try {
    const data = await graphQlQuery(refreshTokenMutation({ token, refreshToken }));

    return data.refresh_token || null;
  } catch (e) {
    throw new ApiError("something-went-wrong");
  }
}));

const authRouter = new AuthRouter();

authRouter.get("/jwt", (req, res) => {
  if (req.authHeader) {
    res.write(req.authHeader);
  }

  res.end();
});

router.use(authRouter);

export default router;
