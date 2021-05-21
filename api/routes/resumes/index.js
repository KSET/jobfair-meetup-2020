import {
  HttpStatus,
} from "../../helpers/http";
import {
  ApiError,
  AuthRouter,
} from "../../helpers/route";
import ResumeService from "../../services/resume-service";

const authRouter = new AuthRouter({});

authRouter.get("/list", async ({ authHeader }) => {
  return await ResumeService.list(authHeader);
});

authRouter.get("/for-user/:uid", async ({ authHeader, params }) => {
  const resume = await ResumeService.byUid(authHeader, params.uid);

  if (!resume) {
    throw new ApiError(
      "Resume not found",
      HttpStatus.Error.Client.NotFound,
    );
  }

  return resume;
});

authRouter.get("/info/:id", async ({ authHeader, params }) => {
  const { id } = params;

  const resume = await ResumeService.byId(authHeader, id);

  if (!resume) {
    throw new ApiError("Resume not found", HttpStatus.Error.Client.NotFound);
  }

  return resume;
});

export default authRouter;
