import axios from "axios";

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
 * @returns {Promise<void>}
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
