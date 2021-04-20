import {
 HttpStatus,
} from "../../helpers/http";
import {
 Role,
} from "../../helpers/permissions";
import {
  ApiError,
  AuthRouter,
} from "../../helpers/route";
import FileService from "../../services/file-service";

const authRouter = new AuthRouter({ role: Role.moderator });

authRouter.post("/", async ({ files, authUser }) => {
  const { file } = files;

  if (!file) {
    throw new ApiError("no-file", HttpStatus.Error.Forbidden, [
      "No file provided",
    ]);
  }

  return await FileService.upload(file, authUser.id);
});

export default authRouter;
