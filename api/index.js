import {
  join as joinPath,
} from "path";

import express from "express";
import * as Sentry from "@sentry/node";
import fileUpload from "express-fileupload";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import {
  morgan,
} from "../helpers/logger";
import {
  HttpStatus,
} from "../api/helpers/http";

import {
  getClient,
  query,
} from "../db/methods";
import {
  base as dbBase,
  versions as dbVersions,
} from "../db/structure";

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
});

const app = express();

Sentry.init({ dsn: process.env.SENTRY_DSN });

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());

const routes = registerRoutesInFolder(joinPath(__dirname, "routes"));

app.set("x-powered-by", false);

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUploadMiddleware);
app.use(morgan("API"));

app.use(routes);

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

// Fallback route (404)
app.use("*", apiRoute(() => {
  throw new ApiError("not-found", HttpStatus.Error.Client.NotFound);
}));

const client = getClient();

query(dbBase)
  .then(async () => {
    console.log("|> Database base set.");
    console.log("|> Running migrations...");

    try {
      await client.connect();

      await client.query("BEGIN");

      const [ lastVersion = {} ] = await client.query({
        text: `
          select
            *
          from
            db_versions
          order by
            "id" desc
          limit 1
        `,
      });

      const lastVersionIndex =
        dbVersions
          .findIndex(
            ({ name }) =>
              name === lastVersion.name
            ,
          )
      ;

      const remainingVersions = dbVersions.slice(lastVersionIndex + 1);

      for (const version of remainingVersions) {
        console.log("\t", "Migration:", version.name);

        await client.query({
          text: version.up,
        });

        await client.query({
          text: `
            insert into db_versions
              (
                 "name"
              )
            values
              (
                $1
              )
          `,
          values: [
            version.name,
          ],
        });
      }

      await client.query("COMMIT");
      console.log("|> Migrations done");
    } catch (e) {
      await client.query("ROLLBACK");
      console.log("|> Migration error! Aborting...");
      console.log(e);
    } finally {
      await client.end();
    }
  })
;

export default app;
