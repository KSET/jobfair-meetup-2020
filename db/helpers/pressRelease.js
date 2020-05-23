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
  ({
     title,
     fileId,
   }) => ({
    text: `
      insert into press_release
        (
          "title",
          "file_id"
        )
      values
        (
          $1,
          $2
        )
      returning id
    `,
    values: [
      title,
      fileId,
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
  (
    id,
    {
      title,
      fileId,
    },
  ) => {
    const pressRelease = {
      title,
      // eslint-disable-next-line camelcase
      file_id: fileId,
    };

    const filteredPressRelease =
      Object
        .entries(pressRelease)
        .filter(([ _, v ]) => v)
    ;

    const setters = filteredPressRelease.map(([ k ], i) => `${ k } = $${ i + 1 }`);
    const values = filteredPressRelease.map(([ _, v ]) => v);

    return {
      text: `
        update
          press_release
        set
          ${ setters.join(", ") }
        where
          id = $${ setters.length + 1 }
        returning
          id
      `,
      values: [
        ...values,
        id,
      ],
    };
  }
;
