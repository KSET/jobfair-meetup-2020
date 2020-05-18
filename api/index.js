import {
  join as joinPath,
} from "path";

import express from "express";
import fileUpload from "express-fileupload";
import bodyParser from "body-parser";

import {
  apiRoute,
  ApiError,
  registerRoutesInFolder,
} from "./helpers/route";

const fileUploadMiddleware = fileUpload({
  useTempFiles: true,
  tempFileDir: "/tmp/",
  createParentPath: true,
  abortOnLimit: true,
  limits: {
    fileSize: 12 * 1024 * 1024,
  },
  limitHandler: apiRoute(() => {
    return "file-too-big";
  }),
});

const app = express();
const routes = registerRoutesInFolder(joinPath(__dirname, "routes"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUploadMiddleware);

app.use(routes);

// Fallback route (404)
app.use("*", apiRoute(() => {
  throw new ApiError("not-found", 404);
}));

export default {
  path: "/api",
  handler: app,
};
