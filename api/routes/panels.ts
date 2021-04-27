import {
  HttpStatus,
} from "../helpers/http";
import {
  RoleNames,
} from "../helpers/permissions";
import {
  ApiError,
  AuthRouter,
  Router,
} from "../helpers/route";
import PanelsService from "../services/panels-service";

const router = new Router();

router.get("/list", async () => {
  return await PanelsService.list();
});

router.get("/list/with-info", async () => {
  return await PanelsService.listWithInfo();
});

router.get("/full-info/:id", async ({ params }) => {
  const { id } = params;

  return await PanelsService.fullInfo(id);
});

router.get("/info/:id", async ({ params }) => {
  const { id } = params;

  return await PanelsService.info(id);
});

const authRouter = AuthRouter.boundToRouter(router, {
  role: RoleNames.ADMIN,
});

authRouter.post("/", async ({ body }) => {
  const { date, ...rest } = body;

  return await PanelsService.create({
    ...rest,
    occuresAt: date,
  });
});

authRouter.patch("/:id", async ({ body, params }) => {
  const { date, ...rest } = body;
  const { id } = params;

  if (!id) {
    throw new ApiError("Missing id", HttpStatus.Error.Client.UnprocessableEntity);
  }

  return await PanelsService.update(
    id,
    {
      ...rest,
      occuresAt: date,
    },
  );
});

authRouter.delete("/:id", async ({ params }) => {
  const { id } = params;

  return await PanelsService.delete(id);
});

export default authRouter;
