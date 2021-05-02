import _ from "lodash/fp";
import type {
  CamelCasedPropertiesDeep,
} from "type-fest";
import {
  queryNewsCreate,
  queryNewsDeleteBySlug,
  queryNewsGetAll,
  queryNewsGetBySlug,
  queryNewsUpdateBySlug,
} from "../../db/helpers/news";
import type {
  NewsCreateData,
  NewsData,
  News as DbNews,
} from "../../db/helpers/news";
import {
  Client,
} from "../../db/methods";
import {
  toSlug,
} from "../../helpers/string";
import type {
  User,
} from "../graphql/types";
import {
  HttpStatus,
} from "../helpers/http";
import {
  ServiceError,
} from "./error-service";
import ImageService from "./image-service";
import type {
  ImageInfo,
} from "./image-service";

export interface News extends Pick<CamelCasedPropertiesDeep<DbNews>, "slug" | "title" | "description" | "content" | "date"> {
  images: Record<ImageInfo["name"], Omit<ImageInfo, "name" | "imageId">>
}

const processNews =
  (images: ImageInfo[]) =>
    ({ slug, title, description, content, date, image_id: imageId }: DbNews): News => {
      const imageList =
        images
          .filter((i) => i.imageId === imageId)
          .sort((a, b) => b.width - a.width)
      ;

      imageList.push({
        ...(imageList.pop() as ImageInfo),
        name: "thumb",
      });

      const newsImages: News["images"] = Object.fromEntries(
        imageList.map(
          ({ name, imageId: _imageId, ...image }) =>
            [ name, image ]
          ,
        ),
      );

      return {
        slug,
        title,
        description,
        content,
        date,
        images: newsImages,
      };
    }
;

type ValidationOutput = false | [ string, string ];

const validateNews = (body: NewsData | NewsCreateData): Exclude<ValidationOutput, false>[] => {
  type Prop = keyof NewsCreateData;

  const minLength =
    (prop: Prop, length: number): ValidationOutput =>
      body[prop] && length < String(body[prop]).length
      ? false
      : [ prop, `${ _.capitalize(prop) } must be at least ${ length } characters long` ]
  ;

  const maxLength =
    (prop: Prop, length: number): ValidationOutput =>
      body[prop] && length > String(body[prop]).length
      ? false
      : [ prop, `${ _.capitalize(prop) } must be at most ${ length } characters long` ]
  ;

  const validDate =
    (prop: Prop): ValidationOutput => {
      const data = body[prop] as string;
      const date = Date.parse(data);

      if (!isNaN(date)) {
        return false;
      }

      return [ prop, `${ _.capitalize(prop) } must be a valid date` ];
    }
  ;

  const validations = [
    minLength("title", 5),
    minLength("description", 5),
    maxLength("description", 130),
    minLength("content", 5),
    validDate("date"),
  ];

  return validations.filter((e) => false !== e) as Exclude<ValidationOutput, false>[];
};

export class NewsServiceError extends ServiceError {
}

export default class NewsService {
  static async list(): Promise<News[]> {
    const rawNews = await Client.queryOnce<DbNews>(queryNewsGetAll()) || [];
    const images = await ImageService.listInfo(...rawNews.map((n) => n.image_id));

    return rawNews.map(processNews(images));
  }

  static async info(slug: News["slug"]): Promise<News> {
    const rawNews = await Client.queryOneOnce<DbNews>(queryNewsGetBySlug(slug));

    if (!rawNews) {
      throw new NewsServiceError(
        "not-found",
        null,
        HttpStatus.Error.Client.NotFound,
      );
    }

    const images = await ImageService.listInfo(rawNews.image_id);

    return processNews(images)(rawNews);
  }

  static async update(
    slug: News["slug"],
    body: NewsData,
  ): Promise<Pick<News, "slug">> {
    return await Client.transaction<Pick<DbNews, "slug">>(async (client) => {
      const oldNews = await client.queryOne<DbNews>(queryNewsGetBySlug(slug));

      if (!oldNews) {
        throw new NewsServiceError(
          "news-not-found",
          {
            global: "News not found",
          },
          HttpStatus.Error.Forbidden,
        );
      }

      const errors = validateNews(body);

      if (0 < errors.length) {
        throw new NewsServiceError(
          "validation-failed",
          Object.fromEntries(errors),
          HttpStatus.Error.Forbidden,
        );
      }

      const res = await client.queryOne<Pick<DbNews, "slug">>(queryNewsUpdateBySlug(slug, {
        ...body,
        date: new Date(String(body.date)),
      })) as Pick<DbNews, "slug">;

      return {
        slug: res.slug,
      };
    });
  }

  static async create(
    creatorId: User["id"],
    body: NewsCreateData,
  ): Promise<News & { id: DbNews["id"] }> {
    const errors = validateNews(body);

    if (0 < errors.length) {
      throw new NewsServiceError(
        "validation-failed",
        Object.fromEntries(errors),
        HttpStatus.Error.Forbidden,
      );
    }

    const sluggedTitle = toSlug(body.title);
    const timeStamp = Date.now().toString(36);

    const newNews: NewsCreateData = {
      ...body,
      slug: `${ sluggedTitle }-${ timeStamp }`,
      date: new Date(String(body.date)),
      creatorId,
    };

    const res = await Client.queryOneOnce<DbNews>(queryNewsCreate(newNews));

    if (!res) {
      throw new NewsServiceError(
        "something-went-wrong",
      );
    }

    const data = {
      id: res.id,
      ...newNews,
    } as unknown as DbNews;

    const images = await ImageService.listInfo(newNews.imageId);

    return processNews(images)(data) as (News & { id: DbNews["id"] });
  }

  static async remove(slug: News["slug"]): Promise<true> {
    return await Client.transaction<true>(async (client) => {
      const news = await client.queryOne<DbNews>(queryNewsGetBySlug(slug));

      if (!news) {
        throw new NewsServiceError(
          "not-found",
          [
            "News item not found",
          ],
          HttpStatus.Error.Client.NotFound,
        );
      }

      await client.query<DbNews>(queryNewsDeleteBySlug(slug));

      return true;
    });
  }
}
