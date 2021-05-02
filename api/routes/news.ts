import {
  toSlug,
} from "../../helpers/string";
import {
  HttpStatus,
} from "../helpers/http";
import {
  RoleNames,
} from "../helpers/permissions";
import {
  queryImageGetById,
  queryImageGetByIds,
} from "../../db/helpers/image";
import type {
  ImageInfo as DbImageInfo,
} from "../../db/helpers/image";
import {
  queryNewsGetAll,
  queryNewsGetBySlug,
  queryNewsUpdateBySlug,
  queryNewsCreate,
  queryNewsDeleteBySlug,
} from "../../db/helpers/news";
import type {
  News as DbNews,
} from "../../db/helpers/news";
import {
  Client,
} from "../../db/methods";
import {
  apiFilePath,
} from "../helpers/image";
import {
  ApiError,
  Router,
  AuthRouter,
} from "../helpers/route";

const router = new Router();

const processImage =
  ({ image_id: imageId, name, width, height }) => ({
    imageId,
    name,
    width,
    height,
    url: apiFilePath({ imageId, name }),
  })
;

const processNews =
  (images) =>
    ({ slug, title, description, content, date, image_id: imageId }) => {
      const imageList =
        images
          .filter((i) => i.imageId === imageId)
          .sort((a, b) => b.width - a.width)
      ;

      imageList.push({
        ...imageList.pop(),
        name: "thumb",
      });

      const newsImages = Object.fromEntries(
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

const capitalize = (s) => {
  if ("string" !== typeof s) {
    return "";
  }

  return s.charAt(0).toUpperCase() + s.slice(1);
};

type ValidationOutput = false | [ string, string ];

const validateNews = (body: DbNews): Exclude<ValidationOutput, false>[] => {
  type Prop = keyof DbNews;

  const minLength =
    (prop: Prop, length: number): ValidationOutput =>
      body[prop] && length < String(body[prop]).length
      ? false
      : [ prop, `${ capitalize(prop) } must be at least ${ length } characters long` ]
  ;

  const maxLength =
    (prop: Prop, length: number): ValidationOutput =>
      body[prop] && length > String(body[prop]).length
      ? false
      : [ prop, `${ capitalize(prop) } must be at most ${ length } characters long` ]
  ;

  const validDate =
    (prop: Prop): ValidationOutput => {
      const data = body[prop] as string;
      const date = Date.parse(data);

      if (!isNaN(date)) {
        return false;
      }

      return [ prop, `${ capitalize(prop) } must be a valid date` ];
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

router.get("/list", async () => {
  const rawNews = await Client.queryOnce<DbNews>(queryNewsGetAll()) || [];
  const rawImages = await Client.queryOnce<DbImageInfo>(queryImageGetByIds(...rawNews.map((n) => n.image_id))) || [];

  const images = rawImages.map(processImage);

  return rawNews.map(processNews(images));
});

router.get("/item/:slug", async ({ params }) => {
  const { slug } = params;

  const rawNews = await Client.queryOneOnce<DbNews>(queryNewsGetBySlug(slug));

  if (!rawNews) {
    throw new ApiError("not-found", HttpStatus.Error.Client.NotFound);
  }

  const rawImages = await Client.queryOnce<DbImageInfo>(queryImageGetById(rawNews.image_id)) || [];

  const images = rawImages.map(processImage);

  return processNews(images)(rawNews);
});

const authRouter = AuthRouter.boundToRouter(router, { role: RoleNames.MODERATOR });

authRouter.patch("/item/:slug", async ({ params, body }) => {
  return await Client.transaction<Pick<DbNews, "slug">>(async (client) => {
    const oldNews = await client.queryOne<DbNews>(queryNewsGetBySlug(params.slug));

    if (!oldNews) {
      throw new ApiError("news-not-found", HttpStatus.Error.Forbidden, {
        global: "News not found",
      });
    }

    const errors = validateNews(body);

    if (0 < errors.length) {
      throw new ApiError("validation-failed", HttpStatus.Error.Forbidden, Object.fromEntries(errors));
    }

    const res = await client.queryOne<Pick<DbNews, "slug">>(queryNewsUpdateBySlug(params.slug, {
      ...body,
      date: new Date(body.date),
    })) as Pick<DbNews, "slug">;

    return {
      slug: res.slug,
    };
  });
});

authRouter.put("/item/", async ({ body, authUser }) => {
  if (!body.imageId) {
    throw new ApiError("image-required", HttpStatus.Error.Forbidden, {
      global: "Image is required",
    });
  }

  const errors = validateNews(body);

  if (0 < errors.length) {
    throw new ApiError("validation-failed", HttpStatus.Error.Forbidden, Object.fromEntries(errors));
  }

  const sluggedTitle = toSlug(body.title);
  const timeStamp = Date.now().toString(36);

  const newNews = {
    ...body,
    slug: `${ sluggedTitle }-${ timeStamp }`,
    date: new Date(body.date),
    creatorId: authUser.id,
  };

  const res = await Client.queryOneOnce<DbNews>(queryNewsCreate(newNews));

  if (!res) {
    throw new ApiError("something-went-wrong");
  }

  return {
    id: res.id,
    ...newNews,
  };
});

authRouter.delete("/item/:slug", async ({ params }) => {
  const { slug } = params;

  return await Client.transaction<true>(async (client) => {
    const news = await client.queryOne<DbNews>(queryNewsGetBySlug(slug));

    if (!news) {
      throw new ApiError("not-found", HttpStatus.Error.Client.NotFound, [
        "News item not found",
      ]);
    }

    await client.query<DbNews>(queryNewsDeleteBySlug(slug));

    return true;
  });
});

export default authRouter;
