export const queryImageCreate =
  ({
     name,
     creatorId,
   }) => ({
    text: "insert into images (\"name\", creator_id) values ($1, $2) returning id",
    values: [
      name,
      creatorId,
    ],
  })
;

export const queryImageGetById =
  (id) => ({
    text: `
      select
        *
      from
          images i
      left join
          image_variations iv
          on i.id = iv.image_id
      where
          i.id = $1
    `,
    values: [
      id,
    ],
  })
;

export const queryImageGetByIds =
  (...ids) => ({
    text: `
      select
        *
      from
          images i
      left join
          image_variations iv
          on i.id = iv.image_id
      where
          i.id = ANY($1::int[])
    `,
    values: [
      ids.flat(),
    ],
  })
;

export const queryImageVariationCreate =
  ({
     name,
     path,
     width,
     height,
     imageId,
     mimeType,
   }) => ({
    text: "insert into image_variations (\"name\", \"path\", width, height, image_id, mime_type) values ($1, $2, $3, $4, $5, $6) returning id, \"name\", image_id",
    values: [
      name,
      path,
      width,
      height,
      imageId,
      mimeType,
    ],
  })
;

export const queryImageVariationGetByNameAndImage =
  ({
     name,
     imageId,
   }) => ({
    text: `
      select
        *
      from
        image_variations
      where
            "name" = $1
        and image_id = $2
    `,
    values: [
      name,
      imageId,
    ],
  });
