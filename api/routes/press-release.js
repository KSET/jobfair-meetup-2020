import {
  Router,
  AuthRouter,
} from "../helpers/route";
import {
  Role,
} from "../helpers/permissions";
import PressReleaseService from "../services/press-release-service";

const router = new Router();

router.get("/all", async () => {
  return await PressReleaseService.list();
});

router.get("/release/:id", async ({ params }) => {
  const { id } = params;

  return await PressReleaseService.info(id);
});

const authRouter = AuthRouter.boundToRouter(router, {
  role: Role.moderator,
});

authRouter.put("/", async ({ body }) => {
  const {
    title,
    fileId,
    date: rawDate,
  } = body;

  const date =
    rawDate
    ? new Date(rawDate)
    : undefined
  ;

  return await PressReleaseService.create({
    title,
    fileId,
    date,
  });
});

authRouter.patch("/:id", async ({ params, body }) => {
  const { id } = params;
  const {
    title,
    fileId,
    date: rawDate,
  } = body;

  const date =
    rawDate
    ? new Date(rawDate)
    : undefined
  ;

  return await PressReleaseService.update(
    id,
    {
      title,
      fileId,
      date,
    },
  );
});

authRouter.delete("/:id", async ({ params }) => {
  const { id } = params;

  return await PressReleaseService.delete(id);
});

export default authRouter;
