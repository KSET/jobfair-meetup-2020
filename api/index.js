import {
  join as joinPath,
} from "path";
import {
  readdirSync,
} from "fs";

import express from "express";

import {
  error,
} from "./helpers";

const app = express();

// Register all .js files in routes directory as express routes
readdirSync(joinPath(__dirname, "routes"))
  // Only consider JS files
  .filter((filename) => filename.endsWith(".js"))
  // Require files and register with express
  .forEach((fileName) => {
    // Add full path to filename
    const filePath = joinPath(__dirname, "routes", fileName);

    // Remove .js from file name to get route name
    const routeName =
      fileName
        .split(".")
        .slice(0, -1)
        .join(".")
    ;

    // Register route
    app.use(`/${ routeName }`, require(filePath).default);
  })
;

// Fallback route (404)
app.use("*", (req, res) => {
  res.json(error({
    status: 404,
    reason: "not-found",
  }));
});

export default {
  path: "/api",
  handler: app,
};
