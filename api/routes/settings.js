import {
  Router,
} from "express";
import {
  requireAuth,
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

const router = Router();

router.get("/list", apiRoute(() => {
  return query(querySettingsGetAll());
}));

router.post("/", requireAuth({ role: "admin" }), apiRoute(async ({ body }) => {
  const { key, value } = body;

  if (!key || !value) {
    throw new ApiError("no-params", 403, [
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

export default router;
