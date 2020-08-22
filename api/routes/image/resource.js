import {
  Router,
} from "express";
import {
 HttpStatus,
} from "../../helpers/http";
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
    throw new ApiError("not-found", HttpStatus.Error.NotFound);
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
    res.status(HttpStatus.Error.NotFound);
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
    throw new ApiError("not-found", HttpStatus.Error.NotFound, [
      "Image not found",
    ]);
  }

  return image;
}));

export default router;
