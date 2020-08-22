import {
  mkdir as mkdirCb,
} from "fs";
import {
  promisify,
} from "util";
import {
 HttpStatus,
} from "../../helpers/http";
import {
  ApiError,
  AuthRouter,
} from "../../helpers/route";
import {
  apiFilePath,
  localFilePath,
  localFolderPath,
} from "../../helpers/file";
import {
  getClient,
} from "../../../db/methods";
import {
  queryFileGetByHashAndPath,
  queryFileCreate,
} from "../../../db/helpers/file";
import {
 RoleNames,
} from "../../helpers/permissions";

const mkdir = promisify(mkdirCb);

const authRouter = new AuthRouter({ role: RoleNames.MODERATOR });

authRouter.post("/", async ({ files, authUser }) => {
  const client = getClient();

  try {
    const { file } = files;

    if (!file) {
      throw new ApiError("no-file", HttpStatus.Error.Forbidden, [
        "No file provided",
      ]);
    }

    await client.connect();

    await client.query("BEGIN");

    await mkdir(localFolderPath(), { recursive: true });

    const fileData = {
      name: file.name,
      size: file.size,
      hash: file.md5,
      path: localFilePath(file),
      mimeType: file.mimetype,
      uploaderId: authUser.id,
    };

    await file.mv(fileData.path);

    try {
      const [ { id: fileId } ] = await client.query(queryFileCreate(fileData));

      fileData.id = fileId;
      fileData.url = apiFilePath({ fileId });
    } catch (e) {
      if ("files_path_uindex" === e.constraint) {
        const [ file ] = await client.query(queryFileGetByHashAndPath(fileData));

        if (file) {
          file.url = apiFilePath({ fileId: file.id });

          return file;
        }
      }

      throw e;
    }

    await client.query("COMMIT");

    return fileData;
  } finally {
    await client.query("ROLLBACK");
    await client.end();
  }
});

export default authRouter;
