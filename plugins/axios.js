const baseUrl =
  process.server
  ? `http://${ process.env.HOST || "localhost" }:${ process.env.PORT || 3000 }`
  : "";

export default function({ $axios }, inject) {
  const api = $axios.create({});

  api.setBaseURL(`${ baseUrl }/api`);

  inject("api", api);
}
