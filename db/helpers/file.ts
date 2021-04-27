import {
  rmdir as rmdirOld,
} from "fs";
import {
  dirname,
} from "path";
import {
  promisify,
} from "util";
import {
  Client,
  Query,
} from "../methods";
import {
  generateDeleteQuery,
  generateSelectQuery,
  insertQuery,
} from "../query";

const rmdir = promisify(rmdirOld);

/* eslint-disable camelcase */
export interface File {
  id: number;
  name: string;
  size: number;
  hash: string;
  uploader_id: number;
  path: string;
  mime_type: string;
  created_at: string | Date;
  updated_at: string | Date;
}

/* eslint-enable camelcase */

const table = "files";

export const queryFileCreate =
  insertQuery(table)({
    allowedKeys: [
      "name",
      "size",
      "hash",
      "path",
      "mimeType",
      "uploaderId",
    ],
  })
;

export const queryFileGetById =
  (
    {
      id,
    }: {
      id: File["id"];
    },
  ): Query => generateSelectQuery({
    table,
    where: {
      id,
    },
  })
;

export const queryFileDeleteById =
  (
    {
      id,
    }: {
      id: File["id"];
    },
  ): Query => generateDeleteQuery({
    table,
    where: {
      id,
    },
  })
;

export const deleteFileById =
  async (
    client: Client,
    {
      id,
    }: {
      id: File["id"];
    },
  ): Promise<boolean> => {
    const file = await client.queryOne<File>(queryFileGetById({ id }));

    if (!file) {
      return false;
    }

    await client.query(queryFileDeleteById({ id }));
    await rmdir(dirname(file.path), { recursive: true });

    return true;
  }
;

export const queryFileGetByIds =
  (
    ...ids: File["id"][]
  ): Query => ({
    text: `
      select
        *
      from
        files
      where
        "id" = ANY($1::int[])
    `,
    values: [
      ids.flat(),
    ],
  });

export const queryFileGetByHashAndPath =
  (
    {
      hash,
      path,
    }: {
      hash: File["hash"];
      path: File["path"];
    },
  ): Query => generateSelectQuery({
    table,
    where: {
      hash,
      path,
    },
  })
;
