import {
  Router,
} from "express";
import {
  queryImageGetById,
  queryImageGetByIds,
} from "../../db/helpers/image";
import {
  queryNewsGetAll,
  queryNewsGetBySlug,
} from "../../db/helpers/news";
import {
  query,
} from "../../db/methods";
import {
  apiFilePath,
} from "../helpers/image";
import {
  ApiError,
  apiRoute,
} from "../helpers/route";

const router = Router();

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
          ({ name, imageId, ...image }) =>
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


router.get("/list", apiRoute(async () => {
  const rawNews = await query(queryNewsGetAll());
  const rawImages = await query(queryImageGetByIds(...rawNews.map((n) => n.image_id)));

  const images = rawImages.map(processImage);

  return rawNews.map(processNews(images));
}));

router.get("/item/:slug", apiRoute(async ({ params }) => {
  const { slug } = params;

  const [ rawNews ] = await query(queryNewsGetBySlug(slug));

  if (!rawNews) {
    throw new ApiError("not-found", 404);
  }

  const rawImages = await query(queryImageGetById(rawNews.image_id));

  const images = rawImages.map(processImage);

  return processNews(images)(rawNews);
}));

export default router;
