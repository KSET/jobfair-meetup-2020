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

const router = Router();

router.get("/", apiRoute(async (req) => {
  const auth = req.get("Authorization");

  try {
    const { data } = await post(
      "https://jobfair.fer.unizg.hr/api/v2/graphql",
      currentUserQuery(),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: auth,
        },
      },
    );

    return data.current_user;
  } catch (e) {
    throw new ApiError("something-went-wrong");
  }
}));

export default router;
