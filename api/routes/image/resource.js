import {
  join as joinPath,
} from "path";
import {
  Router,
} from "express";

const router = Router();

router.get("/:id/:file", (req, res) => {
  const { id, file } = req.params;

  return res.sendFile(joinPath(process.cwd(), "uploads", id, file));
});

export default router;
