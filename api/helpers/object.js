import {
  snakeToCamelCase,
} from "./string";

export const isObject =
  (maybeObject) =>
    "object" === typeof maybeObject &&
    null !== maybeObject
;

export const keysFromSnakeToCamelCase = (object) => {
  if (!isObject(object)) {
    return object;
  }

  if (Array.isArray(object)) {
    return object.map(keysFromSnakeToCamelCase);
  }

  return Object.fromEntries(
    Object
      .entries(object)
      .map(([ k, v ]) => [
        snakeToCamelCase(k),
        keysFromSnakeToCamelCase(v),
      ])
    ,
  );
};

export const mapArray =
  (array, fn) =>
    Array.isArray(array)
    ? array.map(fn)
    : []
;

export const compose = (...functions) =>
  (arg) =>
    functions.reduceRight(
      (acc, fn) =>
        fn(acc)
      ,
      arg,
    )
;
