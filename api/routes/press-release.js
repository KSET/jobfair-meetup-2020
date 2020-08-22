import {
  Router,
} from "express";
import {
 HttpStatus,
} from "../helpers/http";
import {
  formatDate,
} from "../../helpers/date";
import {
  AuthRouter,
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
import {
  roleNames,
} from "../helpers/permissions";

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
    throw new ApiError("not-found", HttpStatus.Error.NotFound);
  }

  res.fileId = res.file_id;
  res.url = apiFilePath(res);
  res.date = formatDate(res.created_at);

  return res;
}));

const authRouter = new AuthRouter({ role: roleNames.MODERATOR });

authRouter.put("/", apiRoute(async ({ body }) => {
  const { title, fileId } = body;

  if (!title) {
    throw new ApiError("no-title", HttpStatus.Error.Forbidden, [
      "The title is missing",
    ]);
  }

  if (!fileId) {
    throw new ApiError("no-file", HttpStatus.Error.Forbidden, [
      "The file is missing",
    ]);
  }

  const [ release ] = await query(queryPressReleaseCreate({ title, fileId }));

  if (!release) {
    throw new ApiError("something-went-wrong", HttpStatus.Error.Forbidden, [
      "Something went wrong. Please try again",
    ]);
  }

  return true;
}));

authRouter.patch("/:id", apiRoute(async ({ params, body }) => {
  const { id } = params;
  const { title, fileId } = body;

  if (!title) {
    throw new ApiError("no-title", HttpStatus.Error.Forbidden, [
      "The title is missing",
    ]);
  }

  if (!fileId) {
    throw new ApiError("no-file", HttpStatus.Error.Forbidden, [
      "The file is missing",
    ]);
  }

  const [ release ] = await query(queryPressReleaseGetById({ id }));

  if (!release) {
    throw new ApiError("no-press-release", HttpStatus.Error.Forbidden, [
      "Press release not found",
    ]);
  }

  const [ newRelease ] = await query(queryPressReleaseUpdateById(id, { title, fileId }));

  if (!newRelease) {
    throw new ApiError("no-press-release", HttpStatus.Error.Forbidden, [
      "Something went wrong. Please try again",
    ]);
  }

  return newRelease;
}));

authRouter.delete("/:id", apiRoute(async ({ params }) => {
  const { id } = params;

  await query(queryPressReleaseDeleteById({ id }));

  return id;
}));

router.use(authRouter);

export default router;
