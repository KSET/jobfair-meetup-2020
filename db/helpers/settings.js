export const querySettingsGetAll =
  () => ({
    text: `
      select
        *
      from
        "settings"
    `,
  })
;

export const querySettingsGetByKey =
  (
    key,
  ) => ({
    text: `
      select
        *
      from
        "settings"
      where
        "key" = $1
    `,
    values: [
      key,
    ],
  })
;

export const querySettingsUpdateByKey =
  (
    key,
    value,
  ) => ({
    text: `
      update
        "settings"
      set
        "value" = $1
      where
        "key" = $2
    `,
    values: [
      value,
      key,
    ],
  })
;

export const querySettingsCreate =
  (
    {
      key,
      value,
    },
  ) => ({
    text: `
      insert into "settings"
        ("key", "value")
      values
        ($1, $2)
      returning id
    `,
    values: [
      key,
      value,
    ],
  })
;
