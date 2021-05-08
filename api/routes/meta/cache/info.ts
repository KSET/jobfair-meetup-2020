import _ from "lodash/fp";
import {
  clearCacheKey,
  getCache,
} from "../../../helpers/fetchCache";
import {
  Router,
} from "../../../helpers/route";

const router = new Router();

const removeData = <T extends { data: never }>({ data: _data, ...rest }: T = { data: null } as T): Omit<T, "data"> => rest;
const removeDataFromCache: (cache: ReturnType<typeof getCache>) => unknown = _.mapValues(removeData);

router.get("/", () => {
  const cache = getCache();

  return removeDataFromCache(cache);
});

router.get("/with-data", () => {
  return getCache();
});

router.get("/for/:key", ({ params }) => {
  const cache = getCache();

  return removeData(cache[params.key]);
});

router.get("/for/:key/with-data", ({ params }) => {
  const cache = getCache();

  return cache[params.key];
});

router.delete("/:key", ({ params }) => {
  clearCacheKey(params.key);

  return true;
});

export default router;
