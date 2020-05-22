export const queryTranslationsGetAll =
  () => ({
    text: "select * from translations",
  })
;

export const queryTranslationsGetByKey =
  (
    key,
  ) => ({
    text: `
      select
        *
      from
        translations
      where
        "key" = $1
    `,
    values: [
      key,
    ],
  })
;

export const queryTranslationsInsertOne =
  ({
     key,
     value,
   }) => ({
    text: `
      insert into translations
        ("key", "value")
      values
        ($1,    $2)
      returning  "key", "value"
    `,
    values: [
      key,
      value,
    ],
  })
;

export const queryTranslationsUpdateByKey =
  (
    key,
    value,
  ) => ({
    text: `
      update
        translations
      set
        "value" = $1,
        updated_at = current_timestamp
      where
        "key" = $2
    `,
    values: [
      value,
      key,
    ],
  })
;
