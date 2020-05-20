import {
  mkdir as mkdirCb,
} from "fs";
import {
  join as joinPath,
} from "path";
import {
  promisify,
} from "util";
import {
  Router,
} from "express";
import sharp from "sharp";
import {
  requireAuth,
} from "../../helpers/middleware";

const mkdir = promisify(mkdirCb);

const router = Router();

let i = 0;

const extensionMap = {
  "image/gif": "gif",
  "image/png": "png",
  "image/jpeg": "jpg",
};

const imageSizes = [ 80, 160, 240, 320, 400, 480, "default" ];

router.use(requireAuth());

router.post("/", async (req, res) => {
  let files = {};

  const error = (message, data = {}) => {
    res.status(415);

    return res.json({
      _csError: true,
      type: "HttpError",
      code: "illegalMimeType",
      message,
      data,
      level: "warn",
    });
  };

  try {
    const { file } = req.files;

    if (!file) {
      return error("No file provided");
    }

    const ext = extensionMap[file.mimetype];

    if (!ext) {
      return error(`Invalid file type. Only ${ Object.values(extensionMap).map((ext) => `.${ ext }`).join(", ") } supported.`, {
        mimeType: file.mimetype,
      });
    }

    const id = `image-${ i++ }`;
    const dir = joinPath(process.cwd(), "uploads", id);

    await mkdir(dir, { recursive: true });

    const fileUploadName =
      (name) =>
        Number.isInteger(name)
        ? `w${ name }.${ ext }`
        : `${ name }.${ ext }`
    ;

    const fileUploadPath =
      (name) =>
        joinPath(dir, fileUploadName(name))
    ;

    if ("gif" === ext) {
      const filePath = fileUploadPath("default");

      await file.mv(filePath);

      files = {
        default: filePath,
      };
    } else {
      const resizedImages =
        imageSizes
          .slice(0, -1)
          .map(
            (width) =>
              sharp(file.tempFilePath)
                .resize({
                  width,
                  fit: "contain",
                })
                .toFile(fileUploadPath(width))
            ,
          )
      ;

      await Promise.all([
        ...resizedImages,
        sharp(file.tempFilePath)
          .resize({
            width: 2048,
            withoutEnlargement: true,
            fit: "contain",
          })
          .toFile(fileUploadPath("default")),
      ]);

      files = Object.fromEntries(
        imageSizes
          .map(
            (size) =>
              [ size, `/api/image/resource/${ id }/${ fileUploadName(size) }` ]
            ,
          ),
      );
    }
  } catch (e) {
    return error("Something went wrong. Please try again.");
  }

  return res.json(files);
});

export default router;
