import type {
  CamelCasedPropertiesDeep,
} from "type-fest";
import type {
 User,
} from "../../api/graphql/types";
import type {
  Query,
} from "../methods";
import type {
 Image,
} from "./image";

/* eslint-disable camelcase */

export interface News {
  id: number;
  title: string;
  description: string;
  content: string;
  date: string;
  slug: string;
  creator_id: User["id"];
  image_id: Image["id"];
  created_at: string;
  updated_at: string;
}

export type NewsCreateData = Omit<CamelCasedPropertiesDeep<News>, "createdAt" | "updatedAt" | "id">;

export type NewsData = Pick<NewsCreateData, "date" | "content" | "title" | "description" | "imageId">

/* eslint-enable camelcase */

export const queryNewsGetBySlug =
  (
    slug: News["slug"],
  ): Query => ({
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
  (): Query => ({
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
    slug: News["slug"],
    {
      date,
      content,
      title,
      description,
      imageId,
    }: NewsData,
  ): Query => {
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
  (
    {
      date,
      content,
      title,
      slug,
      description,
      creatorId,
      imageId,
    }: NewsCreateData,
  ): Query => {
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

export const queryNewsDeleteBySlug =
  (
    slug: News["slug"],
  ): Query => ({
    text: `
      delete from
        news
      where
        "slug" = $1
    `,
    values: [
      slug,
    ],
  })
;
