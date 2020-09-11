import {
  AtomicBool,
} from "./atomic";

export const cachedFetcher = (timeoutMs, fetchFn, cacheKeyFn = () => "default") => {
  const getBaseData = () => ({
    time: 0,
    data: null,
    fetching: new AtomicBool(),
  });

  const cache = {};

  const cacheSet = (cacheKey, key, value) => {
    if (!(cacheKey in cache)) {
      cache[cacheKey] = getBaseData();
    }

    cache[cacheKey][key] = value;
  };

  const cacheGet = (cacheKey, key) => {
    if (!(cacheKey in cache)) {
      cache[cacheKey] = getBaseData();
    }

    return cache[cacheKey][key];
  };

  const timeMs = () => {
    const hrTime = process.hrtime();

    return hrTime[0] * 1000 + hrTime[1] / 1000000;
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const setCached = (key, data) => {
    cacheSet(key, "data", data);
    cacheSet(key, "time", timeMs());
  };

  const setFetching = (key, fetching) => {
    cacheGet(key, "fetching").value = fetching;
  };

  const isFetching =
    (key) =>
      cacheGet(key, "fetching").value
  ;

  const testAndSetFetching = (key, ifItIs, thenSetTo) => {
    const oldValue = cacheGet(key, "fetching").testAndSet(ifItIs, thenSetTo);
    const newValue = isFetching(key);

    const changed = oldValue !== newValue;

    if (changed) {
      return thenSetTo;
    } else {
      return ifItIs;
    }
  };

  const waitForFetchingToBe = async (key, fetching) => {
    while (isFetching(key) !== fetching) {
      await sleep(10);
    }

    return fetching;
  };

  const hasCacheEntry =
    (key) =>
      Boolean(getCacheEntry(key))
  ;

  const getCacheEntry =
    (key) =>
      cacheGet(key, "data")
  ;

  const hasCached =
    (key) =>
      hasCacheEntry(key) &&
      (timeMs() - timeoutMs) <= cacheGet(key, "time")
  ;

  return async (...args) => {
    const key = cacheKeyFn(...args);
    // console.log("CACHE GET", key);

    if (hasCached(key)) {
      // console.log("CACHE FRESH", key);
      return getCacheEntry(key);
    }

    const fetchData = async () => {
      setFetching(key, true);

      // console.log("FETCH START", key);
      const data = await fetchFn(...args);
      // console.log("FETCH  DONE", key);

      setCached(key, data);

      setFetching(key, false);

      return data;
    };

    if (hasCacheEntry(key)) {
      // console.log("CACHE STALE", key);
      if (testAndSetFetching(key, false, true)) {
        // run in background
        setTimeout(fetchData, 0);
      }

      return getCacheEntry(key);
    }

    if (isFetching(key)) {
      await waitForFetchingToBe(key, false);

      return getCacheEntry(key);
    }

    // console.log("CACHE  MISS", key);
    return await fetchData();
  };
};
