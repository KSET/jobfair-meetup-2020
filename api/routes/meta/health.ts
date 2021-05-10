import isLive from "../../helpers/health";
import {
  Router,
} from "../../helpers/route";

const router = new Router();

router.get("/live", () => {
  return isLive();
});

export default router;
