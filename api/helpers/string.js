/**
 * @param string
 * @return {string}
 */
export const snakeToCamelCase =
  (string) =>
    string
      .replace(
        /[-_](\w)/g,
        (match) =>
          String(match[1]).toUpperCase()
        ,
      )
;

/**
 * @param {*} maybeString
 * @return {boolean}
 */
export const isString =
  (maybeString) =>
    null !== maybeString &&
    undefined !== maybeString &&
    String === maybeString.constructor
;
