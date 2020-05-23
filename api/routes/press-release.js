import {
  Router,
} from "express";
import {
  formatDate,
} from "../../helpers/date";
import {
  requireAuth,
} from "../helpers/middleware";
import {
  queryPressReleaseCreate,
  queryPressReleaseDeleteById,
  queryPressReleaseGetAll,
  queryPressReleaseGetById,
  queryPressReleaseUpdateById,
} from "../../db/helpers/pressRelease";
import {
  query,
} from "../../db/methods";
import {
  apiRoute,
  ApiError,
} from "../helpers/route";
import {
  apiFilePath,
} from "../helpers/file";

const router = Router();

router.get("/all", apiRoute(() => {
  /* eslint-disable camelcase */
  return query(queryPressReleaseGetAll())
    .then(
      (res) =>
        res.map(
          ({ path, file_id, ...r }) => ({
            ...r,
            fileId: file_id,
            url: apiFilePath({ fileId: file_id }),
            date: formatDate(r.created_at),
          })
          ,
        )
      ,
    );
  /* eslint-enable camelcase */
}));

router.get("/release/:id", apiRoute(async ({ params }) => {
  const { id } = params;
  const [ res ] = await query(queryPressReleaseGetById({ id }));

  if (!res) {
    throw new ApiError("not-found", 404);
  }

  res.fileId = res.file_id;
  res.url = apiFilePath(res);
  res.date = formatDate(res.created_at);

  return res;
}));

router.put("/", requireAuth({ role: "admin" }), apiRoute(async ({ body }) => {
  const { title, fileId } = body;

  if (!title) {
    throw new ApiError("no-title", 403, [
      "The title is missing",
    ]);
  }

  if (!fileId) {
    throw new ApiError("no-file", 403, [
      "The file is missing",
    ]);
  }

  const [ release ] = await query(queryPressReleaseCreate({ title, fileId }));

  if (!release) {
    throw new ApiError("something-went-wrong", 403, [
      "Something went wrong. Please try again",
    ]);
  }

  return true;
}));

router.patch("/:id", requireAuth({ role: "admin" }), apiRoute(async ({ params, body }) => {
  const { id } = params;
  const { title, fileId } = body;

  if (!title) {
    throw new ApiError("no-title", 403, [
      "The title is missing",
    ]);
  }

  if (!fileId) {
    throw new ApiError("no-file", 403, [
      "The file is missing",
    ]);
  }

  const [ release ] = await query(queryPressReleaseGetById({ id }));

  if (!release) {
    throw new ApiError("no-press-release", 403, [
      "Press release not found",
    ]);
  }

  const [ newRelease ] = await query(queryPressReleaseUpdateById(id, { title, fileId }));

  if (!newRelease) {
    throw new ApiError("no-press-release", 403, [
      "Something went wrong. Please try again",
    ]);
  }

  return newRelease;
}));

router.delete("/:id", requireAuth({ role: "admin" }), apiRoute(async ({ params }) => {
  const { id } = params;

  await query(queryPressReleaseDeleteById({ id }));

  return id;
}));

export default router;
