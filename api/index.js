import {
  join as joinPath,
} from "path";

import express from "express";
import fileUpload from "express-fileupload";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

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
  limits: {
    fileSize: 12 * 1024 * 1024,
  },
  limitHandler: apiRoute(() => {
    throw new ApiError("file-too-big", 413, [
      "The file is too big. Max file size is 12MB.",
    ]);
  }),
});

const app = express();
const routes = registerRoutesInFolder(joinPath(__dirname, "routes"));

app.set("x-powered-by", false);

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUploadMiddleware);

app.use(routes);

// Fallback route (404)
app.use("*", apiRoute(() => {
  throw new ApiError("not-found", 404);
}));

const client = {
  _instance: null,

  async connect() {
    this._instance = await getClient();

    return this._instance;
  },

  async query(...args) {
    if (!this._instance) {
      return;
    }

    return await (
      this
        ._instance
        .query(...args)
        .then(({ rows }) => rows)
        .catch(async (e) => {
          await this._instance.query("ROLLBACK");

          throw e;
        })
    );
  },

  async end() {
    if (!this._instance) {
      return;
    }

    await this._instance.release();
  },
};

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

      const versionStartIndex = Math.max(0, lastVersionIndex);

      for (const version of dbVersions.slice(versionStartIndex)) {
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
      console.error("|> Migrations done");
    } catch (e) {
      await client.query("ROLLBACK");
      console.error("|> Migration error! Aborting...");
      console.error(e);
    } finally {
      await client.end();
    }
  })
;

export default {
  path: "/api",
  handler: app,
};
