import {
  Router,
} from "express";
import {
  queryFileGetByIds,
} from "../../db/helpers/file";
import {
  deleteImageById,
  queryImageGetByIds,
} from "../../db/helpers/image";
import {
  queryPressKitCreate,
  queryPressKitDeleteById,
  queryPressKitGetAll,
  queryPressKitGetById,
  queryPressKitGetLatest,
  queryPressKitUpdateById,
} from "../../db/helpers/pressKit";
import {
  Client,
  query,
} from "../../db/methods";
import {
  filesToEntries,
} from "../helpers/file";
import {
  imagesToEntries,
} from "../helpers/image";
import {
  AuthRouter,
} from "../helpers/middleware";
import {
  roleNames,
} from "../helpers/permissions";
import {
  apiRoute,
  ApiError,
} from "../helpers/route";

const router = new Router();

router.get("/all", apiRoute(async () => {
  const rawPressKits = await query(queryPressKitGetAll());

  const fileIds = new Set();
  const imageIds = new Set();

  for (const rawPressKit of rawPressKits) {
    fileIds.add(rawPressKit.file_id);
    imageIds.add(rawPressKit.image_id);
  }

  const rawFiles = await query(queryFileGetByIds(Array.from(fileIds)));
  const files = filesToEntries(rawFiles);

  const rawImages = await query(queryImageGetByIds(Array.from(imageIds)));
  const images = imagesToEntries(rawImages);

  Object
    .values(images)
    .forEach(({ variations }) => {
      variations.thumb =
        Object
          .values(variations)
          .sort((a, b) => b.width - a.width)
          .pop()
      ;
    })
  ;

  return rawPressKits.map(
    ({
       file_id: fileId,
       image_id: imageId,
       ...pressKit
     }) => ({
      ...pressKit,
      file: files[fileId],
      image: images[imageId],
    })
    ,
  );
}));

const authRouter = new AuthRouter({
  role: roleNames.MODERATOR,
});

authRouter.post("/", apiRoute(async ({ body }) => {
  const {
    title,
    fileId,
    imageId,
  } = body;

  const client = await Client.inTransaction();

  const { order: lastOrder = 0 } = await client.queryOne(queryPressKitGetLatest()) || {};
  const order = lastOrder + 1;

  const newKit = {
    title,
    fileId,
    imageId,
    order,
  };

  const [ { id } ] = await client.query(queryPressKitCreate(newKit));

  newKit.id = id;

  await client.commit(true);

  return newKit;
}));

authRouter.delete("/:id", apiRoute(async ({ params }) => {
  const { id } = params;

  if (!id) {
    throw new ApiError("Press kit ID is required");
  }

  const client = await Client.inTransaction();

  try {
    const item = await client.queryOne(queryPressKitGetById({ id }));

    if (!item) {
      throw new ApiError("Press kit not found");
    }

    await client.query(queryPressKitDeleteById({ id }));
    const dlSuccess = await deleteImageById(client, { id: item.image_id });

    if (!dlSuccess) {
      throw new ApiError("image-delete", 403, [
        "Something went wrong while deleting the image",
      ]);
    }

    await client.commit(true);

    return true;
  } catch (e) {
    await client.rollback(true);

    console.error(e);

    throw e;
  }
}));

authRouter.post("/swap", apiRoute(async ({ body }) => {
  const { a, b } = body;

  if (!a || !b) {
    throw new ApiError("not-found", 404, [
      "Both press kit items must be provided",
    ]);
  }

  const client = await Client.inTransaction();

  try {
    const [
      A,
      B,
    ] = await Promise.all([
      client.queryOne(queryPressKitGetById({ id: a })),
      client.queryOne(queryPressKitGetById({ id: b })),
    ]);

    if (!A || !B) {
      throw new ApiError("not-found", 404, [
        "Item not found",
      ]);
    }

    await Promise.all([
      client.query(queryPressKitUpdateById(a, { order: B.order })),
      client.query(queryPressKitUpdateById(b, { order: A.order })),
    ]);

    await client.commit(true);

    return true;
  } catch (e) {
    await client.rollback(true);

    console.error(e);

    throw e;
  }
}));

router.use(authRouter);

export default router;
