import {
  AuthRouter,
} from "../../helpers/route";
import {
  Role,
} from "../../helpers/permissions";
import ImageService, {
  ImageUploadError,
} from "../../services/image-service";

const router = new AuthRouter({ role: Role.moderator });

router.postRaw("/", async ({ files, authUser }, res) => {
  try {
    const images = await ImageService.upload(files.file, authUser.id);

    return res.json(Object.fromEntries(
      Object
        .values(images)
        .map(({ name, url }) => [ name, url ])
      ,
    ));
  } catch (e) {
    res.status(415);

    const payload = {
      _csError: true,
      type: "HttpError",
      code: "illegalMimeType",
      message: e.message,
      level: "warn",
    };

    if (e instanceof ImageUploadError) {
      payload.data = e.data;
    }

    return res.json(payload);
  }
});

export default router;
