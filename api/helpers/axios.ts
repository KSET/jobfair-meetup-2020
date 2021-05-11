import axios from "axios";
import type {
  AxiosRequestConfig,
} from "axios";
import {
  getSetting,
} from "./settings";

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
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

export async function get<T>(url: string, config: AxiosRequestConfig = {}): Promise<T> {
  return await request<T>({ url, method: "GET", ...config });
}


export async function post<T>(url: string, data: unknown = undefined, config: AxiosRequestConfig = {}): Promise<T> {
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

export interface GraphQlQueryParams {
  query: string;
  operationName?: string;
  variables?: Record<string, unknown>;
}

export async function graphQlQuery<T>({ query, operationName, variables }: GraphQlQueryParams, token = "", timeout = 0): Promise<T> {
  const config: AxiosRequestConfig =
    token
    ? {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        timeout,
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
