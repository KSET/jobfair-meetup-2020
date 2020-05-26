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

export const dotGet =
  (object, key, defaultValue = "") => {
    const keys = key.split(".");

    let k;
    let v = object;
    // eslint-disable-next-line no-cond-assign
    while (v && (k = keys.shift())) {
      v = v[k];
    }

    return (
      v === undefined
      ? defaultValue
      : v
    );
  }
;
