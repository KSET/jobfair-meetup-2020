import {
 HttpStatus,
} from "../helpers/http";
import {
  formatDate,
} from "../../helpers/date";
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
  ApiError,
  Router,
  AuthRouter,
} from "../helpers/route";
import {
  apiFilePath,
} from "../helpers/file";
import {
  RoleNames,
} from "../helpers/permissions";

const router = new Router();

router.get("/all", () => {
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
});

router.get("/release/:id", async ({ params }) => {
  const { id } = params;
  const [ res ] = await query(queryPressReleaseGetById({ id }));

  if (!res) {
    throw new ApiError("not-found", HttpStatus.Error.NotFound);
  }

  res.fileId = res.file_id;
  res.url = apiFilePath(res);
  res.date = formatDate(res.created_at);

  return res;
});

const authRouter = AuthRouter.boundToRouter(router, { role: RoleNames.MODERATOR });

authRouter.put("/", async ({ body }) => {
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
});

authRouter.patch("/:id", async ({ params, body }) => {
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
});

authRouter.delete("/:id", async ({ params }) => {
  const { id } = params;

  await query(queryPressReleaseDeleteById({ id }));

  return id;
});

export default authRouter;
