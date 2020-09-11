import morganLogger from "morgan";

/**
 * @param {String} resourceName
 * @param {Object} options
 */
export const morgan =
  (resourceName, options = {}) =>
    morganLogger(
      `[:date[iso]] ${ resourceName } | :method :url | :status :response-time[3]ms :res[content-length]b | ":referrer" ":user-agent"`,
      {
        skip() {
          return "development" === process.env.NODE_ENV;
        },
        ...options,
      },
    )
;
