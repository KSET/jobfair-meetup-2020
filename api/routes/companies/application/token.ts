import {
  HttpStatus,
} from "../../../helpers/http";
import {
 RoleNames,
} from "../../../helpers/permissions";
import {
  ApiError,
  AuthRouter,
  Router,
} from "../../../helpers/route";
import CompanyApplicationTokenService from "../../../services/company-application-token-service";

const router = new Router();

router.post("/verify", async ({ body }) => {
  const { token } = body;

  if (!token) {
    throw new ApiError(
      "Token se mora predati",
      HttpStatus.Error.Client.UnprocessableEntity,
    );
  }

  return await CompanyApplicationTokenService.isApplicationTokenValid(token);
});

const authRouter = AuthRouter.boundToRouter(router, {
  role: RoleNames.ADMIN,
});

authRouter.post("/", async ({ body, authUser }) => {
  const createdBy = authUser.id;
  const { note } = body;

  return await CompanyApplicationTokenService.createApplicationToken(createdBy, note);
});

authRouter.delete("/:id", async ({ params }) => {
  const { id } = params;

  return await CompanyApplicationTokenService.deleteApplicationTokenById(id);
});

authRouter.get("/list", async () => {
  return await CompanyApplicationTokenService.listApplicationTokens();
});

export default authRouter;
