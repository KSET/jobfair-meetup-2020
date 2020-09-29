export default function({ $axios, isDev, $sentry, store, req }, inject) {
  const api = $axios.create({});

  const baseUrl =
    process.server
    ? `http://localhost:${ isDev ? "3000" : process.env.PORT }`
    : ""
  ;

  api.setBaseURL(`${ baseUrl }/api`);
  api.setHeader("Content-Type", "application/json");

  api.interceptors.response.use(
    (response) => response,
    ({ response, config }) => {
      $sentry.captureMessage(
        config.url,
        {
          req,
          extra: {
            responseData: response.data,
            postData: config.data,
          },
          level: "error",
          user: store.getters["user/getUser"],
        },
      );

      return response;
    },
  );

  inject("api", api);
}
