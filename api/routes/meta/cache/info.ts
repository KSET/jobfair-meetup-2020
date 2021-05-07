import {
  clearCacheKey,
  getCache,
} from "../../../helpers/fetchCache";
import {
  Router,
} from "../../../helpers/route";

const router = new Router();

router.get("/", () => {
  return getCache();
});

router.get("/clear/:key", ({ params }) => {
  clearCacheKey(params.key);

  return true;
});

export default router;
