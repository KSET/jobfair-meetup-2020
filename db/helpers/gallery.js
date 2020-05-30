import {
  generateSetters,
  generateValues,
  cleanObjectValues,
} from "../query";

export const queryGalleryGetAll =
  () => ({
    text: `
      select
        *
      from
        press_gallery
      order by
        "order" asc
    `,
  })
;

export const queryGalleryCreate =
  ({
     title,
     description,
     imageId,
     order,
   }) => ({
    text: `
      insert into press_gallery
        (
          "title",
          "description",
          "image_id",
          "order"
        )
      values
        (
          $1,
          $2,
          $3,
          $4
        )
      returning id
    `,
    values: [
      title,
      description,
      imageId,
      order,
    ],
  })
;

export const queryGalleryGetById =
  ({
     id,
   }) => ({
    text: `
      select
        *
      from
        press_gallery
      where
        "id" = $1
    `,
    values: [
      id,
    ],
  })
;

export const queryGalleryGetLatest =
  () => ({
    text: `
      select
        *
      from
        press_gallery
      order by
        "order" desc
      limit 1
    `,
  })
;


export const queryGalleryUpdateById =
  (
    id,
    {
      order,
      title,
      description,
      imageId,
    },
  ) => {
    const item = cleanObjectValues(
      {
        order,
        title,
        description,
        // eslint-disable-next-line camelcase
        image_id: imageId,
      },
    );

    const setters = generateSetters(item);
    const values = generateValues(item);
    const idIdx = values.length + 1;

    return {
      text: `
      update
        press_gallery
      set
        ${ setters }
      where
        "id" = $${ idIdx }
    `,
      values: [
        ...values,
        id,
      ],
    };
  }
;

export const queryGalleryDeleteById =
  (
    {
      id,
    },
  ) => ({
    text: `
      delete from
        press_gallery
      where
        "id" = $1
    `,
    values: [
      id,
    ],
  })
;
