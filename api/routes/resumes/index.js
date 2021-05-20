import {
  withoutKeys,
} from "../../../helpers/object";
import {
  get,
} from "../../helpers/axios";
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

authRouter.getRaw("/info/:id.pdf", async ({ authHeader, params, headers: reqHeaders }, res) => {
  const { id } = params;
  const resume = await ResumeService.byId(authHeader, id);

  try {
    if (!resume) {
      throw new ApiError("Resume not found", HttpStatus.Error.Client.NotFound);
    }

    const { resumeFileData } = resume;

    const headers = withoutKeys([ "cookie", "host", "referer", "connection" ], reqHeaders);
    const response = await get(resumeFileData, {
      responseType: "stream",
      headers,
    });

    res.header(response.headers);

    response.pipe(res);
    response.on("end", () => resume.end());
  } catch (e) {
    res.status(HttpStatus.Error.Client.NotFound);
    return res.end();
  }
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
