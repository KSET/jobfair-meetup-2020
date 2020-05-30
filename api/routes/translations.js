import {
  Router,
} from "express";
import {
  queryTranslationsGetAll,
  queryTranslationsGetByKey,
  queryTranslationsInsertOne,
  queryTranslationsUpdateByKey,
} from "../../db/helpers/translations";
import {
  query,
  getClient,
} from "../../db/methods";
import {
  apiRoute,
  ApiError,
} from "../helpers/route";

const router = Router();

const fetchAllTranslations =
  async () => {
    const translations = await query(queryTranslationsGetAll());

    return Object.fromEntries(
      translations
        .map(
          ({ key, value }) =>
            [ key, value ]
          ,
        )
      ,
    );
  }
;

router.get("/all", apiRoute(async () => {
  return await fetchAllTranslations();
}));

router.put("/", apiRoute(async ({ body: keys = [] }) => {
  if (!Array.isArray(keys)) {
    throw new ApiError("invalid-keys");
  }

  const client = getClient();

  try {
    await client.connect();

    await client.query("BEGIN");

    await Promise.all(
      keys
        .map(
          (key) =>
            client
              .query(queryTranslationsInsertOne({ key, value: key }))
              .catch((e) => console.log("|> TRANSLATION KEY ERROR", e))
          ,
        )
      ,
    );
    await client.query("COMMIT");

    return await fetchAllTranslations();
  } catch (e) {
    await client.query("ROLLBACK");

    throw e;
  } finally {
    await client.end();
  }
}));

router.patch("/:key", apiRoute(async ({ body, params }) => {
  const { key } = params;
  const { value } = body;

  if (!value) {
    throw new ApiError("value-missing", 403, [
      "Value not set",
    ]);
  }

  const [ translation = {} ] = await query(queryTranslationsGetByKey(key));

  if (!translation.key) {
    translation.key = key;
    translation.value = value;

    await query(queryTranslationsInsertOne(translation));
  } else {
    translation.value = value;

    await query(queryTranslationsUpdateByKey(key, value));
  }

  return translation;
}));

export default router;
