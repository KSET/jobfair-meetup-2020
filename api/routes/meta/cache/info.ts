import {
  clearCacheKey,
  getCache,
} from "../../../helpers/fetchCache";
import {
 RoleNames,
} from "../../../helpers/permissions";
import {
  AuthRouter,
  Router,
} from "../../../helpers/route";

const router = new Router();

router.get("/", () => {
  return getCache();
});

const authRouter = AuthRouter.boundToRouter(
  router,
  {
    role: RoleNames.ADMIN,
  },
);

authRouter.get("/clear/:key", ({ params }) => {
  clearCacheKey(params.key);

  return true;
});

export default authRouter;
