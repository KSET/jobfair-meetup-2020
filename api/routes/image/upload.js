import {
  mkdir as mkdirCb,
} from "fs";
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
import {
  apiFilePath,
  localFilePath,
  localFolderPath,
} from "../../helpers/image";
import {
  getClient,
} from "../../../db/methods";
import {
  queryImageCreate,
  queryImageVariationCreate,
} from "../../../db/helpers/image";

const mkdir = promisify(mkdirCb);

const router = Router();

const extensionMap = {
  "image/gif": "gif",
  "image/png": "png",
  "image/jpeg": "jpg",
};

const imageSizes = [ 80, 160, 240, 320, 400, 480, "default" ];

router.use(requireAuth({ role: "admin" }));

router.post("/", async (req, res) => {
  const files = {};
  const client = {
    instance: null,

    async connect() {
      this.instance = await getClient();

      return this.instance;
    },

    async query(...args) {
      if (!this.instance) {
        return;
      }

      return await this.instance.query(...args);
    },

    async end() {
      if (!this.instance) {
        return;
      }

      await this.instance.release();
    },
  };

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

    await client.connect();

    await client.query("BEGIN");

    const createImageResponse = await client.query(queryImageCreate({
      name: file.name,
      creatorId: req.authUser.id,
    }));

    const [ { id: imageId } ] = createImageResponse.rows;
    const dir = localFolderPath({ imageId });

    await mkdir(dir, { recursive: true });

    const fileUploadName =
      (name) =>
        Number.isInteger(name)
        ? `w${ name }.${ ext }`
        : `${ name }.${ ext }`
    ;

    const fileUploadPath =
      (name) =>
        localFilePath({
          imageId,
          name: fileUploadName(name),
        })
    ;

    const createImageVariation =
      (filenameOverride = "") =>
        async ({ width, height }) =>
          await client
            .query(queryImageVariationCreate({
              name: filenameOverride || width,
              path: fileUploadPath(filenameOverride || width),
              width,
              height,
              imageId,
              mimeType: file.mimetype,
            }))
            .then(({ rows: [ row ] }) => row)
    ;

    const uploadGif = async ({ file }) => {
      const filePath = fileUploadPath("default");

      await file.mv(filePath);

      const { image_id: imageId, name } = await createImageVariation("default")({
        width: 300,
        height: 300,
      });

      return {
        default: apiFilePath({ imageId, name }),
      };
    };

    const uploadImage = async ({ file, imageSizes }) => {
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
                .then(createImageVariation())
            ,
          )
      ;

      const imageData = await Promise.all([
        ...resizedImages,
        sharp(file.tempFilePath)
          .resize({
            width: 2048,
            withoutEnlargement: true,
            fit: "contain",
          })
          .toFile(fileUploadPath("default"))
          .then(createImageVariation("default")),
      ]);

      return Object.fromEntries(
        imageData
          .map(
            ({ image_id: imageId, name }) =>
              [ name, apiFilePath({ imageId, name }) ]
            ,
          ),
      );
    };

    const uploadHandler =
      "gif" === ext
      ? uploadGif
      : uploadImage
    ;

    Object.assign(
      files,
      await uploadHandler({ file, imageSizes }),
    );
  } catch (e) {
    await client.query("ROLLBACK");
    await client.end();

    console.log("|> UPLOAD ERROR", e);

    return error("Something went wrong. Please try again.");
  }

  await client.query("COMMIT");
  await client.end();

  return res.json(files);
});

export default router;
