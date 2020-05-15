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
