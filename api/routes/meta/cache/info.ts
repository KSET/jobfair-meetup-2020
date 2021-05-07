import _ from "lodash/fp";
import {
  clearCacheKey,
  getCache,
} from "../../../helpers/fetchCache";
import {
  Router,
} from "../../../helpers/route";

const router = new Router();

router.get("/", () => {
  const cache = getCache();

  return _.flow(
    _.toPairs,
    _.map(([ k, { data: _data, ...rest } ]) => [ k, rest ]),
    _.fromPairs,
  )(cache);
});

router.get("/with-data", () => {
  return getCache();
});

router.get("/clear/:key", ({ params }) => {
  clearCacheKey(params.key);

  return true;
});

export default router;
