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
