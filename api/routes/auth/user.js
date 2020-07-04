import {
  apiRoute,
} from "../../helpers/route";
import {
  AuthRouter,
} from "../../helpers/middleware";

const router = new AuthRouter({ fullUserData: true });

router.get("/", apiRoute((req) => {
  return req.authUser;
}));

export default router;
