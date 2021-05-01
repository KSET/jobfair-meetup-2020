import {
  mkdir as mkdirCb,
} from "fs";
import {
  promisify,
} from "util";
import {
  UploadedFile,
} from "express-fileupload";
import type {
  CamelCasedPropertiesDeep,
} from "type-fest";
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
import type {
  Image as DbImage,
  ImageVariation as DbImageVariation,
  ImageInfo as DbImageInfo,
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
import type {
  User,
} from "../graphql/types";
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

type Image = CamelCasedPropertiesDeep<DbImage>;
type ImageVariation = CamelCasedPropertiesDeep<DbImageVariation>;

export type ImageInfo = Pick<Image & ImageVariation, "name" | "imageId" | "width" | "height"> & { url: string };

export class ImageError extends ServiceError {
}

export class ImageUploadError extends ImageError {
}

export default class ImageService {
  static async info(id: Image["id"]): Promise<Image[] | null> {
    return await Client.queryOnce<Image>(queryImageGetById(id));
  }

  static async listInfo(...ids: Image["id"][]): Promise<ImageInfo[]> {
    const res = await Client.queryOnce<DbImageInfo>(queryImageGetByIds(...ids.flat())) || [];

    const format: (arg: DbImageInfo) => ImageInfo = pipe(
      keysFromSnakeToCamelCase,
      (image: CamelCasedPropertiesDeep<DbImageInfo>) => ({
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

  static async listInfoAsObject(...ids: Image["id"][]): Promise<Record<ImageInfo["imageId"], ImageInfo[]>> {
    const list = await this.listInfo(...ids);

    return this.imageListToObject(list);
  }

  static async variationInfo(id: Image["id"], name: Image["name"]): Promise<DbImageVariation> {
    return await Client.queryOneOnce<DbImageVariation>(queryImageVariationGetByNameAndImage({
      imageId: id,
      name,
    })) as DbImageVariation;
  }

  static async upload(file: UploadedFile, uploaderId: User["id"], dbClient: Client | null = null): Promise<Record<string, ImageInfo>> {
    const files: Record<string, ImageInfo> = {};
    const client = await Client.extend(dbClient);

    const uploadGif = async ({ file, imageId, extension }) => {
      const filePath = this.getUploadPath({ imageId, name: "default", extension });

      await file.mv(filePath);

      const image = await this.createImageVariation({
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
                .toFile(this.getUploadPath({
                  imageId,
                  name: width,
                  extension,
                }))
                .then(this.createImageVariation({
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
          .toFile(this.getUploadPath({
            imageId,
            name: "default",
            extension,
          }))
          .then(this.createImageVariation({
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

    let imageFolder = "";
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

      const image = await client.queryOne<{ id: Image["id"] }>(queryImageCreate({
        name: file.name,
        creatorId: uploaderId,
      }));

      if (!image) {
        throw new ImageUploadError("Slika nije predana");
      }

      const { id: imageId } = image;

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

      if (!dbClient) {
        await client.commit();
      }
    } catch (e) {
      if (!dbClient) {
        await client.rollback();
      }

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
      if (!dbClient) {
        await client.end();
      }
    }

    return files;
  }

  static async remove(id: Image["id"], dbClient: Client | null = null): Promise<boolean> {
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

  private static imageListToObject(images: ImageInfo[]): Record<ImageInfo["imageId"], ImageInfo[]> {
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
          {} as Record<ImageInfo["imageId"], ImageInfo[]>,
        )
    );
  }

  private static getUploadName(
    {
      name,
      extension,
    }: {
      name: Image["name"];
      extension: string;
    },
  ): string {
    if (Number.isInteger(name)) {
      return `w${ name }.${ extension }`;
    } else {
      return `${ name }.${ extension }`;
    }
  }

  private static getUploadPath(
    {
      imageId,
      name,
      extension = "",
    }: {
      imageId: Image["id"];
      name: ImageVariation["name"];
      extension: string;
    },
  ): string {
    return localFilePath({
      imageId,
      name: this.getUploadName({ name, extension }),
    });
  }

  private static createImageVariation(
    {
      dbClient,
      imageId,
      mimeType,
      filenameOverride = "",
      extension = "",
    }: {
      dbClient: Client;
      imageId: Image["id"];
      mimeType: ImageVariation["mimeType"];
      filenameOverride?: string;
      extension?: string;
    },
  ) {
    return async ({ width, height }: { width: number; height: number }): Promise<ImageVariation> => {
      const name = String(filenameOverride || width);
      const image =
        await
          dbClient
            .queryOne<DbImageVariation>(
              queryImageVariationCreate({
                name,
                path: this.getUploadPath({
                  imageId,
                  name,
                  extension,
                }),
                width,
                height,
                imageId,
                mimeType,
              }),
            ) as DbImageVariation
      ;

      return keysFromSnakeToCamelCase(image);
    };
  }
}
