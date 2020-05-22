import {
  Router,
} from "express";
import {
  queryImageGetById,
  queryImageVariationGetByNameAndImage,
} from "../../../db/helpers/image";
import {
  query,
} from "../../../db/methods";
import {
  apiRoute,
  ApiError,
} from "../../helpers/route";

const router = Router();

router.get("/:id", apiRoute(async ({ params }) => {
  const { id } = params;
  const res = await query(queryImageGetById(id));

  if (!res || !res.length) {
    throw new ApiError("not-found", 404);
  }

  return res;
}));

router.get("/:imageId/:name", async (req, res) => {
  const { imageId, name } = req.params;

  const [ image ] = await query(queryImageVariationGetByNameAndImage({
    imageId,
    name,
  }));

  if (!image) {
    res.status(404);
    return res.end();
  }

  res.set("Cache-Control", `max-age=${ 86400000 * 30 }`);

  return res.sendFile(image.path);
});

router.get("/:imageId/:name/info", apiRoute(async (req) => {
  const { imageId, name } = req.params;

  const [ image ] = await query(queryImageVariationGetByNameAndImage({
    imageId,
    name,
  }));

  if (!image) {
    throw new ApiError("not-found", 404, [
      "Image not found",
    ]);
  }

  return image;
}));

export default router;
