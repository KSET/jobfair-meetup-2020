import {
  HttpStatus,
} from "../../helpers/http";
import {
  ApiError,
  Router,
} from "../../helpers/route";
import ImageService from "../../services/image-service";

const router = new Router();

router.get("/:id", async ({ params }) => {
  const { id } = params;
  const res = await ImageService.info(id);

  if (!res || !res.length) {
    throw new ApiError("not-found", HttpStatus.Error.Client.NotFound);
  }

  return res;
});

router.getRaw("/:imageId/:name", async (req, res) => {
  const { imageId, name } = req.params;

  const image = await ImageService.variationInfo(imageId, name);

  if (!image) {
    res.status(HttpStatus.Error.Client.NotFound);
    return res.end();
  }

  res.set("Cache-Control", `max-age=${ 86400000 * 30 }`);

  await new Promise((resolve) => res.sendFile(image.path, {}, resolve));
});

router.get("/:imageId/:name/info", async (req) => {
  const { imageId, name } = req.params;

  const image = await ImageService.variationInfo(imageId, name);

  if (!image) {
    throw new ApiError("not-found", HttpStatus.Error.Client.NotFound, [
      "Image not found",
    ]);
  }

  return image;
});

export default router;
