import {
  cleanObjectValues,
  generateSetters,
  generateValues,
} from "../query";

export const queryPressKitGetAll =
  () => ({
    text: `
      select
        *
      from
        press_kit
      order by
        "order",
        "created_at" desc
    `,
  })
;

export const queryPressKitGetLatest =
  () => ({
    text: `
      select
        *
      from
        press_kit
      order by
        "order" desc
      limit 1
    `,
  })
;

export const queryPressKitGetById =
  ({
     id,
   }) => ({
    text: `
      select
        *
      from
        press_kit
      where
        "id" = $1
    `,
    values: [
      id,
    ],
  })
;

export const queryPressKitCreate =
  ({
     title,
     fileId,
     imageId,
     order,
   }) => ({
    text: `
        insert into press_kit
            (
                "title",
                "file_id",
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
      fileId,
      imageId,
      order,
    ],
  })
;

export const queryPressKitDeleteById =
  ({
     id,
   }) => ({
    text: `
      delete from
        press_kit
      where
        "id" = $1
    `,
    values: [
      id,
    ],
  })
;

export const queryPressKitUpdateById =
  (
    id,
    {
      order,
      title,
      imageId,
      fileId,
    },
  ) => {
    const item = cleanObjectValues(
      {
        order,
        title,
        // eslint-disable-next-line camelcase
        image_id: imageId,
        // eslint-disable-next-line camelcase
        file_id: fileId,
      },
    );

    const setters = generateSetters(item);
    const values = generateValues(item);
    const idIdx = values.length + 1;

    return {
      text: `
      update
        press_kit
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
