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
    text: `
      select
        *
      from
        news
      order by
        "date" desc
    `,
  })
;

export const queryNewsUpdateBySlug =
  (
    slug,
    {
      date,
      content,
      title,
      description,
      imageId,
    },
  ) => {
    const news = {
      date,
      content,
      title,
      description,
      // eslint-disable-next-line camelcase
      image_id: imageId,
    };

    const filteredNews =
      Object
        .entries(news)
        .filter(([ _, v ]) => v)
    ;

    const setters = filteredNews.map(([ k ], i) => `${ k } = $${ i + 1 }`);
    const values = filteredNews.map(([ _, v ]) => v);

    return {
      text: `
        update
          news
        set
          ${ setters.join(", ") }
        where
          slug = $${ setters.length + 1 }
        returning
          slug
      `,
      values: [
        ...values,
        slug,
      ],
    };
  }
;

export const queryNewsCreate =
  ({
     date,
     content,
     title,
     slug,
     description,
     creatorId,
     imageId,
   }) => {
    const news = {
      date,
      content,
      title,
      slug,
      description,
      // eslint-disable-next-line camelcase
      image_id: imageId,
      // eslint-disable-next-line camelcase
      creator_id: creatorId,
    };

    const filteredNews =
      Object
        .entries(news)
        .filter(([ _, v ]) => v)
    ;

    const keys = filteredNews.map(([ k ]) => k);
    const queryValues = filteredNews.map((_, i) => `$${ i + 1 }`);
    const values = filteredNews.map(([ _, v ]) => v);

    return {
      text: `
        insert into news
            (${ keys.join(", ") })
        values
            (${ queryValues.join(", ") })
        returning
          id
      `,
      values: [
        ...values,
      ],
    };
  }
;

