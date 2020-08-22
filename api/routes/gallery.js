import {
 HttpStatus,
} from "../helpers/http";
import {
  apiFilePath,
} from "../helpers/image";
import {
  queryImageGetByIds,
  deleteImageById,
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
  getClient,
  query,
} from "../../db/methods";
import {
  ApiError,
  Router,
  AuthRouter,
} from "../helpers/route";
import {
  RoleNames,
} from "../helpers/permissions";

const router = new Router();

router.get("/list", async () => {
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
});

const authRouter = AuthRouter.boundToRouter(router, { role: RoleNames.MODERATOR });

authRouter.post("/", async ({ body }) => {
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
      throw new ApiError("gallery-not-found", HttpStatus.Error.Forbidden, [
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
});

authRouter.post("/swap", async ({ body }) => {
  const { a, b } = body;

  if (!a || !b) {
    throw new ApiError("not-found", HttpStatus.Error.Client.NotFound, [
      "Both images must be provided",
    ]);
  }

  const [ A ] = await query(queryGalleryGetById({ id: a }));
  const [ B ] = await query(queryGalleryGetById({ id: b }));

  if (!A || !B) {
    throw new ApiError("not-found", HttpStatus.Error.Client.NotFound, [
      "Item not found",
    ]);
  }

  await query(queryGalleryUpdateById(a, { order: B.order }));
  await query(queryGalleryUpdateById(b, { order: A.order }));

  return true;
});

authRouter.delete("/:id", async ({ params }) => {
  const { id } = params;

  const client = getClient();

  try {
    await client.connect();

    await client.query("BEGIN");

    const [ gallery ] = await client.query(queryGalleryGetById({ id }));

    if (!gallery) {
      throw new ApiError("not-found", HttpStatus.Error.Client.NotFound, [
        "Gallery not found",
      ]);
    }

    await client.query(queryGalleryDeleteById({ id }));
    const dlSuccess = await deleteImageById(client, { id: gallery.image_id });

    if (!dlSuccess) {
      throw new ApiError("image-delete", HttpStatus.Error.Forbidden, [
        "Something went wrong while deleting the image",
      ]);
    }

    await client.query("COMMIT");

    return true;
  } catch (e) {
    await client.query("ROLLBACK");
    console.log(e);

    throw e;
  } finally {
    await client.end();
  }
});

export default authRouter;
