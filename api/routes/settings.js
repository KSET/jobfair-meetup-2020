import {
  Router,
} from "express";
import {
 HttpStatus,
} from "../helpers/http";
import {
  AuthRouter,
} from "../helpers/middleware";
import {
  apiRoute,
  ApiError,
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
 roleNames,
} from "../helpers/permissions";

const router = Router();

router.get("/list", apiRoute(() => {
  return query(querySettingsGetAll());
}));

const authRouter = new AuthRouter({ role: roleNames.ADMIN });

authRouter.post("/", apiRoute(async ({ body }) => {
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
}));

router.use(authRouter);

export default router;
