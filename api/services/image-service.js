import {
  mkdir as mkdirCb,
} from "fs";
import {
  promisify,
} from "util";
import rimraf from "rimraf";
import sharp from "sharp";
import {
  deleteImageById,
  queryImageCreate,
  queryImageGetById,
  queryImageGetByIds,
  queryImageVariationCreate,
  queryImageVariationGetByNameAndImage,
} from "../../db/helpers/image";
import {
  Client,
} from "../../db/methods";
import {
  bytesToHumanReadable,
  EXTENSION_MAP,
  MAX_IMAGE_SIZE__B,
} from "../../helpers/image";
import {
  keysFromSnakeToCamelCase,
  pickKeys,
  pipe,
} from "../../helpers/object";
import {
  apiFilePath,
  localFilePath,
  localFolderPath,
} from "../helpers/image";
import {
  ServiceError,
} from "./error-service";

const mkdir = promisify(mkdirCb);

const imageSizes = [ 80, 160, 240, 320, 400, 480, "default" ];

export class ImageError extends ServiceError {
}

export class ImageUploadError extends ImageError {
}

export default class ImageService {
  static async info(id) {
    return await Client.queryOnce(queryImageGetById(id));
  }

  static async listInfo(...ids) {
    const res = await Client.queryOnce(queryImageGetByIds(...ids.flat())) || [];

    const format = pipe(
      keysFromSnakeToCamelCase,
      (image) => ({
        ...pickKeys(
          [
            "name",
            "imageId",
            "width",
            "height",
          ],
          image,
        ),
        url: apiFilePath(image),
      }),
    );

    return res.map(format);
  }

  static async listInfoAsObject(...ids) {
    const list = await this.listInfo(...ids);

    return this.ImageListToObject(list);
  }

  static async variationInfo(id, name) {
    return await Client.queryOneOnce(queryImageVariationGetByNameAndImage({
      imageId: id,
      name,
    }));
  }

  static async upload(file, uploaderId) {
    const files = {};
    const client = await Client.inTransaction();

    const uploadGif = async ({ file, imageId, extension }) => {
      const filePath = this.GetUploadPath({ imageId, name: "default", extension });

      await file.mv(filePath);

      const image = await this.CreateImageVariation({
        dbClient: client,
        imageId,
        mimeType: file.mimetype,
        filenameOverride: "default",
        extension,
      })({
        width: 300,
        height: 300,
      });

      return {
        default: {
          ...image,
          url: apiFilePath(image),
        },
      };
    };

    const uploadImage = async ({ file, imageSizes, imageId, extension }) => {
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
                .toFile(this.GetUploadPath({
                  imageId,
                  name: width,
                  extension,
                }))
                .then(this.CreateImageVariation({
                  dbClient: client,
                  imageId,
                  mimeType: file.mimetype,
                  extension,
                }))
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
          .toFile(this.GetUploadPath({
            imageId,
            name: "default",
            extension,
          }))
          .then(this.CreateImageVariation({
            dbClient: client,
            imageId,
            mimeType: file.mimetype,
            filenameOverride: "default",
            extension,
          })),
      ]);

      return Object.fromEntries(
        imageData
          .map(
            (image) =>
              [
                image.name,
                {
                  ...image,
                  url: apiFilePath(image),
                },
              ]
            ,
          )
        ,
      );
    };

    let imageFolder = null;
    try {
      if (!file) {
        throw new ImageUploadError("Slika nije predana");
      }

      const ext = EXTENSION_MAP[file.mimetype];

      if (!ext) {
        throw new ImageUploadError(`Tip datoteke nije valjan. Podržane su samo ${ Object.values(EXTENSION_MAP).map((ext) => `.${ ext }`).join(", ") } datoteke.`, {
          mimeType: file.mimetype,
        });
      }

      if (file.size > MAX_IMAGE_SIZE__B) {
        throw new ImageUploadError(`Slika prevelika (Najviše ${ bytesToHumanReadable(MAX_IMAGE_SIZE__B) })`);
      }

      const [ { id: imageId } ] = await client.query(queryImageCreate({
        name: file.name,
        creatorId: uploaderId,
      }));

      const dir = localFolderPath({ imageId });

      await mkdir(dir, { recursive: true });

      imageFolder = dir;

      const uploadHandler =
        "gif" === ext
        ? uploadGif
        : uploadImage
      ;

      Object.assign(
        files,
        await uploadHandler({ file, imageSizes, imageId, extension: ext }),
      );

      await client.commit();
    } catch (e) {
      await client.rollback();

      console.log("|> UPLOAD ERROR", e);

      const rm =
        (path) =>
          new Promise((resolve) =>
            rimraf(
              path,
              {
                glob: false,
              },
              resolve,
            ),
          )
      ;

      if (imageFolder) {
        await rm(imageFolder);
      }

      throw e;
    } finally {
      await client.end();
    }

    return files;
  }

  static async remove(id, dbClient = null) {
    const client = dbClient || await Client.inTransaction();

    try {
      await deleteImageById(client, { id });

      if (!dbClient) {
        await client.commit();
      }
    } catch (e) {
      if (!dbClient) {
        await client.rollback();
      }

      return false;
    } finally {
      if (!dbClient) {
        await client.end();
      }
    }

    return true;
  }

  static ImageListToObject(images) {
    return (
      images
        .reduce(
          (acc, img) => {
            if (!(img.imageId in acc)) {
              acc[img.imageId] = [];
            }

            acc[img.imageId].push(img);

            return acc;
          },
          {},
        )
    );
  }

  static GetUploadName(
    {
      name,
      extension,
    },
  ) {
    if (Number.isInteger(name)) {
      return `w${ name }.${ extension }`;
    } else {
      return `${ name }.${ extension }`;
    }
  }

  static GetUploadPath(
    {
      imageId,
      name,
      extension = "",
    },
  ) {
    return localFilePath({
      imageId,
      name: this.GetUploadName({ name, extension }),
    });
  }

  static CreateImageVariation(
    {
      dbClient,
      imageId,
      mimeType,
      filenameOverride = "",
      extension = "",
    },
  ) {
    return async ({ width, height }) => {
      const name = filenameOverride || width;
      const image =
        await
          dbClient
            .queryOne(
              queryImageVariationCreate({
                name,
                path: this.GetUploadPath({
                  imageId,
                  name,
                  extension,
                }),
                width,
                height,
                imageId,
                mimeType,
              }),
            )
      ;

      return keysFromSnakeToCamelCase(image);
    };
  }
}
