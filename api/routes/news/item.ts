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
import NewsService from "../../services/news-service";

const router = new Router();

router.get("/:slug", async ({ params }) => {
  const { slug } = params;

  return await NewsService.info(slug);
});

const authRouter = AuthRouter.boundToRouter(router, {
  role: RoleNames.MODERATOR,
});

authRouter.patch("/:slug", async ({ params, body }) => {
  const { slug } = params;

  return await NewsService.update(slug, body);
});

authRouter.put("/", async ({ body, authUser }) => {
  const { imageId } = body;

  if (!imageId) {
    throw new ApiError("image-required", HttpStatus.Error.Forbidden, {
      global: "Image is required",
    });
  }

  return await NewsService.create(authUser.id, body);
});

authRouter.delete("/:slug", async ({ params }) => {
  const { slug } = params;

  return await NewsService.remove(slug);
});

export default authRouter;
