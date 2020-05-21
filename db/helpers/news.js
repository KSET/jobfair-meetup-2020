export const queryNewsGetBySlug =
  (slug) => ({
    text: `
      select
        *
      from
          news
      where
          slug = $1
    `,
    values: [
      slug,
    ],
  })
;

export const queryNewsGetAll =
  () => ({
    text: "select * from news",
  })
;
