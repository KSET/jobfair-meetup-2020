import {
  isString,
  snakeToCamelCase,
} from "./string";

export const isObject =
  (maybeObject) =>
    "object" === typeof maybeObject &&
    null !== maybeObject
;

export const deepMap = (fn, object) => {
  if (!isObject(object)) {
    return fn({ value: object }).value;
  }

  const boundMap = deepMap.bind(null, fn);

  if (Array.isArray(object)) {
    return object.map(boundMap);
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

export const keysFromSnakeToCamelCase = (object) =>
  deepMap(
    ({ key, value }) => ({
      key: isString(key) ? snakeToCamelCase(key) : key,
      value,
    }),
    object,
  )
;

export const mapArray =
  (array, fn) =>
    Array.isArray(array)
    ? array.map(fn)
    : []
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
