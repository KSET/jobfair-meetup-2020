import {
  HttpStatus,
} from "../../helpers/http";
import {
  ApiError,
  AuthRouter,
} from "../../helpers/route";
import FileService from "../../services/file-service";
import ResumeService from "../../services/resume-service";

const authRouter = new AuthRouter({});

authRouter.get("/list", async () => {
  return await ResumeService.list();
});

authRouter.get("/for-user/:uid", async ({ params }) => {
  const resume = await ResumeService.info(params.uid);

  if (!resume) {
    throw new ApiError(
      "not-found",
      HttpStatus.Error.Client.NotFound,
    );
  }

  return resume;
});

authRouter.getRaw("/info/:uid.pdf", async ({ params }, res) => {
  const resume = await ResumeService.info(params.uid);

  if (!resume) {
    throw new ApiError(
      "Resume not found",
      HttpStatus.Error.Client.NotFound,
    );
  }

  const info: any = await FileService.info(resume.resumeFileId);

  if (!info) {
    throw new ApiError(
      "Resume not found",
      HttpStatus.Error.Client.NotFound,
    );
  }

  res.sendFile(info.path);
});

authRouter.get("/info/:uid", async ({ params }) => {
  const resume = await ResumeService.info(params.uid);

  if (!resume) {
    throw new ApiError(
      "Resume not found",
      HttpStatus.Error.Client.NotFound,
    );
  }

  return resume;
});

export default authRouter;
