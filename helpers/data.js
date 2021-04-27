import {
  isFunction,
} from "./object";

export const ensureArray =
  (val) =>
    Array.isArray(val)
    ? val
    : []
;

export const limitLength =
  (length) =>
    (array) =>
      array.slice(0, length)
;

/**
 * @param {any} object
 * @param {string} key
 * @param {any} defaultValue
 * @returns {any}
 */
export const dotGet =
  (object, key, defaultValue = "") => {
    const keys = key.split(".");

    let k;
    let v = object;
    // eslint-disable-next-line no-cond-assign
    while (v && (k = keys.shift())) {
      v = v[k];
    }

    if (v !== undefined) {
      return v;
    } else if (!isFunction(defaultValue)) {
      return defaultValue;
    } else {
      return defaultValue();
    }
  }
;
