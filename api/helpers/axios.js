import axios from "axios";
import {
  getSetting,
} from "./settings";

/**
 * @param {AxiosRequestConfig} config
 * @returns {Promise<any>}
 */
export async function request(config) {
  return (
    await axios
      .request(config)
      .then(({ data }) => data)
      .catch(({ response, ...rest }) => {
        console.log("|> REQUEST", {
          response,
          ...rest,
        });

        return response.data;
      })
  );
}

/**
 * @param {string} url
 * @param {AxiosRequestConfig} config
 * @returns {Promise<any>}
 */
export async function get(url, config = {}) {
  return await request({ url, method: "GET", ...config });
}


/**
 * @param {string} url
 * @param {any} data
 * @param {AxiosRequestConfig} config
 * @returns {Promise<any>}
 */
export async function post(url, data = undefined, config = {}) {
  return await request({
    url,
    data,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    ...config,
  });
}

/**
 * @param {string} query
 * @param {string} [operationName]
 * @param {object} [variables]
 * @param {string} [token]
 * @returns {Promise<object>}
 */
export async function graphQlQuery({ query, operationName, variables }, token = null) {
  const config =
    token
    ? {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    : {}
  ;

  const endpointUrl = await getSetting(
    "GraphQL Endpoint",
    process.env.JOBFAIR_GRAPHQL_ENDPOINT,
  );

  return (
    await post(
      endpointUrl,
      { operationName, query, variables },
      config,
    )
      .then(({ data }) => data || {})
      .catch((e) => {
        console.log("|> GRAPHQL ERROR", e);

        return {};
      })
  );
}
