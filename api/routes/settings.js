import {
 HttpStatus,
} from "../helpers/http";
import {
  ApiError,
  Router,
  AuthRouter,
} from "../helpers/route";
import {
  query,
} from "../../db/methods";
import {
  querySettingsGetAll,
  querySettingsUpdateByKey,
  querySettingsCreate,
  querySettingsGetByKey,
} from "../../db/helpers/settings";
import {
 RoleNames,
} from "../helpers/permissions";

const router = new Router();

router.get("/list", () => {
  return query(querySettingsGetAll());
});

const authRouter = AuthRouter.boundToRouter(router, { role: RoleNames.ADMIN });

authRouter.post("/", async ({ body }) => {
  const { key, value } = body;

  if (!key || !value) {
    throw new ApiError("no-params", HttpStatus.Error.Forbidden, [
      "Key and value are required",
    ]);
  }

  const [ setting = {} ] = await query(querySettingsGetByKey(key));

  if (!setting.key) {
    setting.key = key;
    setting.value = value;

    const [ { id } ] = await query(querySettingsCreate(setting));

    setting.id = id;
  } else {
    setting.value = value;

    await query(querySettingsUpdateByKey(key, value));
  }

  return setting;
});

export default authRouter;
