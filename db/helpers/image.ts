import {
  rmdir as rmdirOld,
} from "fs";
import {
  dirname,
} from "path";
import {
  promisify,
} from "util";
import type {
  CamelCasedPropertiesDeep,
} from "type-fest";
import type {
  User,
} from "../../api/graphql/types";
import {
  Client,
  Query,
} from "../methods";

const rmdir = promisify(rmdirOld);

/* eslint-disable camelcase */

export interface Image {
  id: number;
  name: string;
  creator_id: User["id"];
  created_at: string;
}

type ImageData = Omit<CamelCasedPropertiesDeep<Image>, "id" | "createdAt">;

export interface ImageVariation {
  id: number;
  name: string;
  path: string;
  width: number;
  height: number;
  image_id: Image["id"];
  mime_type: string;
}

type ImageVariationData = Omit<CamelCasedPropertiesDeep<ImageVariation>, "id">;

export type ImageInfo = Image & ImageVariation & { original_name: Image["name"] };

/* eslint-enable camelcase */

export const queryImageCreate =
  (
    {
      name,
      creatorId,
    }: Pick<ImageData, "name" | "creatorId">,
  ): Query => ({
    text: "insert into images (\"name\", creator_id) values ($1, $2) returning id",
    values: [
      name,
      creatorId,
    ],
  })
;

export const queryImageGetById =
  (
    id: Image["id"],
  ): Query => ({
    text: `
      select
        *,
        i."name" as original_name
      from
          images i
      left join
          image_variations iv
          on i.id = iv.image_id
      where
          i.id = $1
    `,
    values: [
      id,
    ],
  })
;

export const queryImageGetByIds =
  (
    ...ids: Image["id"][]
  ): Query => ({
    text: `
      select
        *,
        i."name" as original_name
      from
          images i
      left join
          image_variations iv
          on i.id = iv.image_id
      where
          i.id = ANY($1::int[])
    `,
    values: [
      ids.flat(),
    ],
  })
;

export const queryImageVariationCreate =
  (
    {
      name,
      path,
      width,
      height,
      imageId,
      mimeType,
    }: ImageVariationData,
  ): Query => ({
    text: "insert into image_variations (\"name\", \"path\", width, height, image_id, mime_type) values ($1, $2, $3, $4, $5, $6) returning id, \"name\", image_id",
    values: [
      name,
      path,
      width,
      height,
      imageId,
      mimeType,
    ],
  })
;

export const queryImageVariationGetByNameAndImage =
  (
    {
      name,
      imageId,
    }: Pick<ImageVariationData, "name" | "imageId">,
  ): Query => ({
    text: `
      select
        *
      from
        image_variations
      where
            "name" = $1
        and image_id = $2
    `,
    values: [
      name,
      imageId,
    ],
  });

export const queryImageDeleteById =
  (
    {
      id,
    }: Pick<Image, "id">,
  ): Query => ({
    text: `
      delete from
        images
      where
        id = $1
    `,
    values: [
      id,
    ],
  })
;

export const deleteImageById =
  async (
    client: Client,
    {
      id,
    }: Pick<Image, "id">,
  ): Promise<boolean> => {
    const [ image ] = await client.query(queryImageGetById(id)) as any;

    if (!image) {
      return false;
    }

    await client.query(queryImageDeleteById({ id }));
    await rmdir(dirname(image.path), { recursive: true });

    return true;
  }
;
