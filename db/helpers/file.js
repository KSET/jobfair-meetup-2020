import {
 rmdir as rmdirOld,
} from "fs";
import {
 dirname,
} from "path";
import {
 promisify,
} from "util";

const rmdir = promisify(rmdirOld);

export const queryFileCreate =
  ({
     name,
     size,
     hash,
     path,
     mimeType,
     uploaderId,
   }) => ({
    text: `
        insert into files
            (
                "name",
                "size",
                "hash",
                "path",
                "mime_type",
                uploader_id
            )
        values
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6
            )
        returning id
    `,
    values: [
      name,
      size,
      hash,
      path,
      mimeType,
      uploaderId,
    ],
  })
;

export const queryFileGetById =
  ({
     id,
   }) => ({
    text: `
      select
        *
      from
        files
      where
        "id" = $1
    `,
    values: [
      id,
    ],
  })
;

export const queryFileDeleteById =
  ({
     id,
   }) => ({
    text: `
      delete from
        files
      where
        "id" = $1
      returning *
    `,
    values: [
      id,
    ],
  })
;

export const deleteFileById =
  async (
    client,
    {
      id,
    },
  ) => {
    const file = await client.queryOne(queryFileGetById({ id }));

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
    ...ids
  ) => ({
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
  ({
     hash,
     path,
   }) => ({
    text: `
      select
        *
      from
        files
      where
            "hash" = $1
        and "path" = $2
    `,
    values: [
      hash,
      path,
    ],
  })
;
