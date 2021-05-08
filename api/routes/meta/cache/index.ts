import {
  refreshCacheItem,
  refreshCacheItems,
} from "../../../helpers/cache";
import {
  RoleNames,
} from "../../../helpers/permissions";
import {
  AuthRouter,
} from "../../../helpers/route";

const authRouter = new AuthRouter(
  {
    role: RoleNames.ADMIN,
  },
);

authRouter.post("/refresh", async ({ authHeader }) => {
  await refreshCacheItems(authHeader);

  return true;
});

authRouter.post("/refresh/:key", async ({ authHeader, params }) => {
  await refreshCacheItem(params.key, authHeader);

  return true;
});

export default authRouter;
