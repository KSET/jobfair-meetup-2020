import _ from "lodash/fp";
import type {
  Opaque,
} from "type-fest";
import {
  AtomicBool,
} from "./atomic";

export type CacheKey = Opaque<string, "CacheKey">;

type Promised<T> = Promise<T> | T;
export type FetchFn<T> = (...args: unknown[]) => Promised<T>;
export type KeyFn = (...args: unknown[]) => CacheKey;

interface ICache<T> {
  time: number;
  cacheFor: number;
  data: T | null;
  fetching: Readonly<AtomicBool>;
}

const cache: Record<CacheKey, ICache<unknown>> = {};

const newCacheEntry = (cacheFor = 0): ICache<unknown> => ({
  time: 0,
  cacheFor,
  data: null,
  fetching: new AtomicBool(),
});

const timeMs = (): number => {
  const hrTime = process.hrtime();

  return hrTime[0] * 1000 + hrTime[1] / 1000000;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getCache = (): Readonly<Record<CacheKey, unknown>> =>
  _.flow(
    _.toPairs,
    _.map(([ key, oldCache ]: [ string, ICache<unknown> ]) => {
      const cache: Omit<ICache<unknown>, "fetching"> = _.omit([ "fetching" ], oldCache);
      const timeCurrent = timeMs();

      return [
        key,
        {
          fetching: oldCache.fetching.value,
          ageMs: timeCurrent - cache.time,
          timeCurrent,
          ...cache,
        },
      ];
    }),
    _.fromPairs,
  )(cache)
;

export const clearCacheKey = (key: keyof (typeof cache)): void => {
  delete cache[key];
};

export const cachedFetcher = <T>(
  baseCacheKey: string,
  timeoutMs: number,
  fetchFn: FetchFn<T>,
  cacheKeyFn: KeyFn = () => "default" as CacheKey,
): (...args: unknown[]) => Promise<T> => {
  type Cache = ICache<T>;

  function cacheSet(cacheKey: CacheKey, key: "time", value: number): void;
  function cacheSet(cacheKey: CacheKey, key: "data", value: T): void;
  function cacheSet(cacheKey: CacheKey, key: keyof Cache, value): void {
    if (!(cacheKey in cache)) {
      cache[cacheKey] = newCacheEntry(timeoutMs);
    }

    cache[cacheKey][key] = value;
  }

  function cacheGet(cacheKey: CacheKey, key: "time"): number;
  function cacheGet(cacheKey: CacheKey, key: "data"): T;
  function cacheGet(cacheKey: CacheKey, key: "fetching"): AtomicBool;
  function cacheGet(cacheKey: CacheKey, key: keyof Cache) {
    if (!(cacheKey in cache)) {
      cache[cacheKey] = newCacheEntry(timeoutMs);
    }

    return cache[cacheKey][key];
  }

  const setData = (key: CacheKey, data: T): void => {
    cacheSet(key, "data", data);
    cacheSet(key, "time", timeMs());
  };

  const setFetching = (key: CacheKey, fetching: boolean): void => {
    cacheGet(key, "fetching").value = fetching;
  };

  const isFetching =
    (key: CacheKey): boolean =>
      cacheGet(key, "fetching").value
  ;

  const testAndSetFetching = (key: CacheKey, ifItIs: boolean, thenSetTo: boolean): boolean => {
    const oldValue = cacheGet(key, "fetching").testAndSet(ifItIs, thenSetTo);
    const newValue = isFetching(key);

    const changed = oldValue !== newValue;

    if (changed) {
      return thenSetTo;
    } else {
      return ifItIs;
    }
  };

  const waitForFetchingToBe = async (key: CacheKey, fetching: boolean): Promise<boolean> => {
    while (isFetching(key) !== fetching) {
      await sleep(10);
    }

    return fetching;
  };

  const hasData =
    (key: CacheKey): boolean =>
      Boolean(getData(key))
  ;

  const getData =
    (key: CacheKey): T =>
      cacheGet(key, "data")
  ;

  const hasFreshCache =
    (key: CacheKey): boolean =>
      hasData(key) &&
      (timeMs() - timeoutMs) <= cacheGet(key, "time")
  ;

  const cacheKey =
    (...args: unknown[]) =>
      `cache:${ baseCacheKey }:${ cacheKeyFn(...args) }` as CacheKey
  ;

  return async (...args: unknown[]): Promise<T> => {
    const key = cacheKey(...args);
    // console.log("CACHE GET", key);

    if (hasFreshCache(key)) {
      // console.log("CACHE FRESH", key);
      return getData(key);
    }

    const fetchData = async () => {
      setFetching(key, true);

      // console.log("FETCH START", key);
      const data = await fetchFn(...args);
      // console.log("FETCH  DONE", key);

      setData(key, data);

      setFetching(key, false);

      return data;
    };

    if (hasData(key)) {
      // console.log("CACHE STALE", key);
      if (testAndSetFetching(key, false, true)) {
        // run in background
        setTimeout(fetchData, 0);
      }

      return getData(key);
    }

    if (isFetching(key)) {
      await waitForFetchingToBe(key, false);

      return getData(key);
    }

    // console.log("CACHE  MISS", key);
    return await fetchData();
  };
};
