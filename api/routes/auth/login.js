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
  loginMutation,
} from "../../graphql/mutations";

const router = Router();

router.post("/", apiRoute(async (req) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError("no-credentials-provided");
  }

  try {
    const data = await graphQlQuery(loginMutation({ email, password }));

    return data.login || null;
  } catch (e) {
    throw new ApiError("something-went-wrong");
  }
}));

export default router;
