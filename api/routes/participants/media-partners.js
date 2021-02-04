import * as Sentry from "@sentry/node";
import {
 HttpStatus,
} from "../../helpers/http";
import {
  RoleNames,
} from "../../helpers/permissions";
import {
  ApiError,
  AuthRouter,
  Router,
} from "../../helpers/route";
import MediaPartnersService from "../../services/media-partners-service";

const router = new Router();

router.get("/", async () => {
  return await MediaPartnersService.list();
});

const authRouter = AuthRouter.boundToRouter(router, {
  role: RoleNames.ADMIN,
});

authRouter.post("/", async (req) => {
  const { body, files, authUser } = req;
  const { image: imageFile } = files || {};
  const { name, link } = body;

  try {
    return await MediaPartnersService.create(
      {
        name,
        link,
        image: imageFile,
      },
      authUser.id,
    );
  } catch (e) {
    if (!(e instanceof ApiError)) {
      Sentry.captureException(e, {
        req,
      });
    }

    throw e;
  }
});

authRouter.delete("/:id", async ({ params }) => {
  const { id } = params;

  return await MediaPartnersService.remove(id);
});

authRouter.post("/swap", async ({ body }) => {
  const { a, b } = body;

  if (!a || !b) {
    throw new ApiError("not-found", HttpStatus.Error.Client.NotFound, [
      "Both partners must be provided",
    ]);
  }

  return await MediaPartnersService.swap(a, b);
});

export default authRouter;
