import {
  Router,
} from "express";
import {
 apiFilePath,
} from "../../helpers/file";
import {
  queryFileGetById,
} from "../../../db/helpers/file";
import {
  query,
} from "../../../db/methods";
import {
  apiRoute,
  ApiError,
} from "../../helpers/route";

const router = Router();

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const [ file ] = await query(queryFileGetById({
    id,
  }));

  if (!file) {
    res.status(404);
    return res.end();
  }

  res.set("Content-Type", "application/octet-stream");
  res.set("Content-Transfer-Encoding", "binary");
  res.set("Content-Disposition", `attachment; filename="${ encodeURI(file.name) }"`);

  return res.sendFile(file.path);
});

router.get("/:id/info", apiRoute(async (req) => {
  const { id } = req.params;

  const [ file ] = await query(queryFileGetById({
    id,
  }));

  if (!file) {
    throw new ApiError("not-found", 404, [
      "Image not found",
    ]);
  }

  file.url = apiFilePath({ fileId: file.id });

  return file;
}));

export default router;
