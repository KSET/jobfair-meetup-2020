const baseUrl =
  process.server
  ? "http://localhost:3000"
  : ""
;

export default function({ $axios }, inject) {
  const api = $axios.create({});

  api.setBaseURL(`${ baseUrl }/api`);
  api.setHeader("Content-Type", "application/json");

  api.interceptors.response.use(
    (response) => response,
    ({ response }) => response,
  );

  inject("api", api);
}
