import {
  HttpStatus,
} from "../helpers/http";
import {
  ApiError,
  Router,
  AuthRouter,
} from "../helpers/route";
import {
  RoleNames,
} from "../helpers/permissions";
import SettingsService from "../services/settings-service";

const router = new Router();

router.get("/list", async () => {
  return await SettingsService.list();
});

const authRouter = AuthRouter.boundToRouter(router, { role: RoleNames.ADMIN });

authRouter.post("/", async ({ body }) => {
  const { key, value } = body;

  if (!key || !value) {
    throw new ApiError("no-params", HttpStatus.Error.Forbidden, [
      "Key and value are required",
    ]);
  }

  return await SettingsService.update(key, value);
});

export default authRouter;
