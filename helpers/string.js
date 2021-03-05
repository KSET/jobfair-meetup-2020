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

export const camelToSnakeCase =
  (string) =>
    string
      .replace(/([A-Z]+)/g, "_$1")
      .toLowerCase()
      .replace(/^_/, "")
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

export const capitalize =
  (str) => {
    if ("string" !== typeof str) {
      return "";
    }

    return str.charAt(0).toUpperCase() + str.slice(1);
  }
;

export const toSlug =
  (text) =>
    String(text)
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\w\s.-_/]/g, "")
      .replace(/\W/gi, "-")
      .replace(/-+/gi, "-")
      .replace(/-*$/gi, "")
;
