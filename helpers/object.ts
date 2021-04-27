import type {
  CamelCasedPropertiesDeep,
  SnakeCasedPropertiesDeep,
} from "type-fest";
import {
  camelToSnakeCase,
  isString,
  snakeToCamelCase,
} from "./string";
import {
  dotGet,
} from "./data";

export const isObject =
  (maybeObject: unknown): maybeObject is Record<string, unknown> =>
    "object" === typeof maybeObject &&
    null !== maybeObject
;

export const isFunction =
  (functionToCheck: unknown): functionToCheck is ((...args: unknown[]) => unknown) =>
    Boolean(functionToCheck) &&
    "[object Function]" === {}.toString.call(functionToCheck)
;

export const pickKeys = <T>(keyList: (keyof T)[], object: T): Partial<T> => {
  const newObject: Partial<T> = {};
  const get = dotGet.bind(null, object);

  for (const key of keyList) {
    newObject[key] = get(key, undefined);
  }

  return newObject;
};

export const pickKeysFn = <T>(pickKeyFn: ((key: keyof T) => boolean), object: T): Partial<T> => {
  const newObject: Partial<T> = {};
  const keys = Object.keys(object) as (keyof T)[];

  for (const key of keys) {
    if (pickKeyFn(key)) {
      newObject[key] = object[key];
    }
  }

  return newObject;
};

export const withoutKeys = <T>(keyList: (keyof T)[], object: T): Partial<T> => {
  const newObject = Object.assign({}, object);

  for (const key of keyList) {
    delete newObject[key];
  }

  return newObject;
};

export const objectWithoutKeys =
  <T>(...keyList: (keyof T)[][]) => (object: T) =>
    withoutKeys(keyList.flat(), object)
;

export const deepMap = <T, R>(fn: (({ key, value }: ({ key?: unknown, value?: unknown })) => ({ key: unknown; value: unknown })), object: T): R => {
  if (!isObject(object) || object instanceof Date) {
    return fn({ value: object }).value as R;
  }

  const boundMap = deepMap.bind(null, fn);

  if (Array.isArray(object)) {
    return object.map(boundMap) as unknown as R;
  }

  return Object.fromEntries(
    Object
      .entries(object)
      .map(([ key, value ]) => [
        fn({ key }).key,
        boundMap(value),
      ])
    ,
  );
};

export const keysFromSnakeToCamelCase = <T>(object: T): CamelCasedPropertiesDeep<T> =>
  deepMap(
    ({ key, value }) => ({
      key: isString(key) ? snakeToCamelCase(key) : key,
      value,
    }),
    object,
  )
;

export const keysFromCamelCaseToSnakeCase = <T>(object: T): SnakeCasedPropertiesDeep<T> =>
  deepMap(
    ({ key, value }) => ({
      key: isString(key) ? camelToSnakeCase(key) : key,
      value,
    }),
    object,
  )
;

export const mapArray =
  <P, Q>(fn: (item: P, index?: number, array?: P[]) => Q) => (array: P[]): Q[] =>
    Array.isArray(array)
    ? array.map(fn)
    : []
;

export const reduceArray =
  <T, R>(initialValue: R | (() => R)) => (fn: (acc: R, value: T, i?: number, arr?: T[]) => R) => (array: T[]): R =>
    Array.isArray(array)
    ? (
      array.reduce(
        fn,
        isFunction(initialValue) ? initialValue() : initialValue,
      )
    )
    : [] as unknown as R
;

export const pipe = (...functions) =>
  (arg) =>
    functions
      .flat()
      .reduce(
        (acc, fn) =>
          fn(acc)
        ,
        arg,
      )
;

export const compose = (...functions) =>
  pipe(
    ...functions.reverse(),
  )
;
