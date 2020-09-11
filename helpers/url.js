export const fixedEncodeURIComponent =
  (str) =>
    encodeURIComponent(str)
      .replace(
        /[!'()*]/g,
        (c) => `%${ c.charCodeAt(0).toString(16) }`,
      )
;

export const encodeRedirectParam =
  ({ name, params }) =>
    Buffer
      .from(
        JSON.stringify({ name, params }),
        "binary",
      )
      .toString("base64")
;

export const decodeRedirectParam =
  (redirectParam, fallback = null) => {
    try {
      return (
        JSON
          .parse(
            Buffer
              .from(
                redirectParam,
                "base64",
              )
              .toString("binary")
            ,
          )
      );
    } catch {
      return fallback;
    }
  }
;
