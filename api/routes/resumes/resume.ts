import contentDisposition from "content-disposition";
import type {
  UploadedFile,
} from "express-fileupload";
import qs from "qs";
import type {
  ResumeData,
} from "../../../db/helpers/resumes";
import {
  HttpStatus,
} from "../../helpers/http";
import {
  Role,
} from "../../helpers/permissions";
import {
  AuthRouter,
} from "../../helpers/route";
import FileService from "../../services/file-service";
import ResumeService from "../../services/resume-service";

const authRouter = new AuthRouter({
  role: Role.student,
});

authRouter.post("/", async ({ authUser, body, files }) => {
  const {
    file,
  }: {
    file: UploadedFile | undefined
  } = files || {};
  const application =
    qs.parse(
      Object
        .entries(body)
        .map(([ key, value ]) => `${ encodeURIComponent(key) }=${ encodeURIComponent(<string> value) }`)
        .join("&")
      ,
    ) as unknown as ResumeData
  ;

  return await ResumeService.submit(authUser.uid, application, file);
});

authRouter.get("/", async ({ authUser }) => {
  return await ResumeService.info(authUser.uid);
});

authRouter.getRaw("/file/:uid.pdf", async ({ params }, res) => {
  const { uid } = params;

  const resume = await ResumeService.baseInfoBy("uid", uid);

  if (!resume) {
    return res.sendStatus(HttpStatus.Error.Client.NotFound);
  }

  const { resumeFileId } = resume;

  const file = await FileService.info(resumeFileId) as any;

  if (!file) {
    return res.sendStatus(HttpStatus.Error.Client.NotFound);
  }

  res.set("Content-Type", "application/octet-stream");
  res.set("Content-Transfer-Encoding", "binary");
  res.set("Content-Disposition", contentDisposition(file.name));

  return res.sendFile(file.path);
});

authRouter.delete("/", async ({ authUser }) => {
  if (!authUser?.resume?.uid) {
    return true;
  }

  await ResumeService.delete(authUser.uid);

  return true;
});

export default authRouter;
