import {
  AtomicBool,
} from "./atomic";

export const cachedFetcher = (timeoutMs, fetchFn) => {
  const cache = {
    time: 0,
    data: null,
    fetching: new AtomicBool(),
  };

  const timeMs = () => {
    const hrTime = process.hrtime();

    return hrTime[0] * 1000 + hrTime[1] / 1000000;
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const setCached = (data) => {
    cache.data = data;
    cache.time = timeMs();
  };

  const setFetching = (fetching) => {
    cache.fetching.value = fetching;
  };

  const isFetching =
    () =>
      cache.fetching.value
  ;

  const testAndSetFetching = (ifItIs, thenSetTo) => {
    const oldValue = cache.fetching.testAndSet(ifItIs, thenSetTo);
    const newValue = isFetching();

    const changed = oldValue !== newValue;

    if (changed) {
      return thenSetTo;
    } else {
      return ifItIs;
    }
  };

  const waitForFetchingToBe = async (fetching) => {
    while (isFetching() !== fetching) {
      await sleep(10);
    }

    return fetching;
  };

  const hasCacheEntry =
    () =>
      Boolean(getCacheEntry())
  ;

  const getCacheEntry =
    () =>
      cache.data
  ;

  const hasCached =
    () =>
      hasCacheEntry() &&
      (timeMs() - timeoutMs) <= cache.time
  ;

  return async (...args) => {
    // console.log("CACHE GET");

    if (hasCached()) {
      // console.log("CACHE FRESH");
      return getCacheEntry();
    }

    const fetchData = async () => {
      setFetching(true);

      // console.log("FETCH START");
      const data = await fetchFn(...args);
      // console.log("FETCH  DONE");

      setCached(data);

      setFetching(false);

      return data;
    };

    if (hasCacheEntry()) {
      // console.log("CACHE STALE");
      if (testAndSetFetching(false, true)) {
        // run in background
        setTimeout(fetchData, 0);
      }

      return getCacheEntry();
    }

    if (isFetching()) {
      await waitForFetchingToBe(false);

      return getCacheEntry();
    }

    // console.log("CACHE  MISS");
    return await fetchData();
  };
};
