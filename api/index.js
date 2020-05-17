import {
  join as joinPath,
} from "path";

import express from "express";

import {
  apiRoute,
  ApiError,
  registerRoutesInFolder,
} from "./helpers";

const app = express();
const routes = registerRoutesInFolder(joinPath(__dirname, "routes"));

app.use(routes);

// Fallback route (404)
app.use("*", apiRoute(() => {
  throw new ApiError("not-found", 404);
}));

export default {
  path: "/api",
  handler: app,
};
