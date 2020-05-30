import {
  Router,
} from "express";
import {
  apiFilePath,
} from "../helpers/image";
import {
  queryImageGetByIds,
} from "../../db/helpers/image";
import {
  queryGalleryCreate,
  queryGalleryGetById,
  queryGalleryGetLatest,
  queryGalleryUpdateById,
  queryGalleryGetAll,
  queryGalleryDeleteById,
} from "../../db/helpers/gallery";
import {
  query,
} from "../../db/methods";
import {
  ApiError,
  apiRoute,
} from "../helpers/route";

const router = Router();

router.get("/list", apiRoute(async () => {
  const galleryItems = await query(queryGalleryGetAll());

  if (0 === galleryItems.length) {
    return [];
  }

  const images = await query(queryImageGetByIds(galleryItems.map(({ image_id: iId }) => iId)));

  const galleryImages =
    (imageId) =>
      Object.fromEntries(
        images
          .filter(
            (image) =>
              image.image_id === imageId
            ,
          )
          .map(
            ({ name }) =>
              [ name, apiFilePath({ imageId, name }) ]
            ,
          ),
      )
  ;

  return galleryItems.map(
    ({ image_id: imageId, ...item }) => ({
      ...item,
      imageId,
      images: galleryImages(imageId),
    }),
  );
}));

router.post("/", apiRoute(async ({ body }) => {
  const { id, order, title, description, imageId } = body;

  const item = Object.fromEntries(
    Object
      .entries({
        id,
        order,
        title,
        description,
        imageId,
      })
      .filter(([ _, v ]) => v)
    ,
  );

  if (!id) {
    if (order) {
      item.order = order;
    } else {
      const [ gallery ] = await query(queryGalleryGetLatest());

      item.order = (gallery && gallery.order) || 1;
      item.order += 1;
    }

    const [ { id: newId } ] = await query(queryGalleryCreate(item));

    item.id = newId;
  } else {
    const [ gallery ] = await query(queryGalleryGetById({ id }));

    if (!gallery) {
      throw new ApiError("gallery-not-found", 403, [
        "Gallery not found",
      ]);
    }

    Object.assign(
      gallery,
      item,
    );

    await query(queryGalleryUpdateById(id, item));
  }

  return item;
}));

router.post("/swap", apiRoute(async ({ body }) => {
  const { a, b } = body;

  if (!a || !b) {
    throw new ApiError("not-found", 404, [
      "Both images must be provided",
    ]);
  }

  const [ A ] = await query(queryGalleryGetById({ id: a }));
  const [ B ] = await query(queryGalleryGetById({ id: b }));

  if (!A || !B) {
    throw new ApiError("not-found", 404, [
      "Item not found",
    ]);
  }

  await query(queryGalleryUpdateById(a, { order: B.order }));
  await query(queryGalleryUpdateById(b, { order: A.order }));

  return true;
}));

router.delete("/:id", apiRoute(async ({ params }) => {
  const { id } = params;

  const [ gallery ] = await query(queryGalleryGetById({ id }));

  if (!gallery) {
    throw new ApiError("not-found", 404, [
      "Gallery not found",
    ]);
  }

  await query(queryGalleryDeleteById({ id }));

  return true;
}));

export default router;
