import contentDisposition from "content-disposition";
import {
  Router,
} from "express";
import {
 HttpStatus,
} from "../../helpers/http";
import {
  fileDbToEntry,
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
    res.status(HttpStatus.Error.Client.NotFound);
    return res.end();
  }

  res.set("Content-Type", "application/octet-stream");
  res.set("Content-Transfer-Encoding", "binary");
  res.set("Content-Disposition", contentDisposition(file.name));

  return res.sendFile(file.path);
});

router.get("/:id/info", apiRoute(async (req) => {
  const { id } = req.params;

  const [ file ] = await query(queryFileGetById({
    id,
  }));

  if (!file) {
    throw new ApiError("not-found", HttpStatus.Error.Client.NotFound, [
      "Image not found",
    ]);
  }

  return fileDbToEntry(file);
}));

export default router;
