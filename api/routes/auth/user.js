import {
 keysFromSnakeToCamelCase,
} from "../../../helpers/object";
import {
 AuthRouter,
} from "../../helpers/route";

const router = new AuthRouter({ fullUserData: true });

router.get("/", (req) => {
  return keysFromSnakeToCamelCase(req.authUser);
});

export default router;
