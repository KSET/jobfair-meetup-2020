import {
  insertQuery,
  updateQuery,
} from "../query";

const table = "press_release";

const insert = insertQuery(table);
const update = updateQuery(table);

export const queryPressReleaseGetAll =
  () => ({
    text: `
      select
        *,
        press_release.id,
        press_release.created_at,
        press_release.updated_at
      from
        press_release
      left join
        files on "files"."id" = "press_release"."file_id"
      order by
        press_release.created_at desc
    `,
  })
;

export const queryPressReleaseGetById =
  ({
     id,
   }) => ({
    text: `
      select
        *, press_release.id
      from
        press_release
      left join
        files on "files"."id" = "press_release"."file_id"
      where press_release.id = $1
    `,
    values: [
      id,
    ],
  })
;

export const queryPressReleaseCreate =
  insert({
    allowedKeys: [
      "title",
      "fileId",
      "date",
    ],
  })
;

export const queryPressReleaseDeleteById =
  ({
     id,
   }) => ({
    text: `
      delete from
        press_release
      where
        "id" = $1
    `,
    values: [
      id,
    ],
  })
;

export const queryPressReleaseUpdateById =
  update(
    {
      allowedWhereKeys: [
        "id",
      ],
      allowedKeys: [
        "title",
        "fileId",
        "date",
      ],
    },
  )
;
