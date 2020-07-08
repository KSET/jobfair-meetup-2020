import {
  join as joinPath,
} from "path";

export const apiFilePath =
  ({ imageId, name }) =>
    `/api/image/resource/${ imageId }/${ name }`
;

export const localFolderPath =
  ({ imageId }) =>
    joinPath(
      process.cwd(),
      "uploads",
      String(imageId),
    )
;

export const localFilePath =
  ({ imageId, name }) =>
    joinPath(
      localFolderPath({ imageId }),
      name,
    )
;

export const addUrlToDbImage =
  (image) =>
    ({
      ...image,
      url: apiFilePath({ imageId: image.image_id, name: image.name }),
    })
;

export const removePathFromDbImage =
  ({
     path: _path,
     ...image
   }) =>
    image
;

export const fixupDbImage =
  (image) =>
    removePathFromDbImage(
      addUrlToDbImage(
        image
        ,
      )
      ,
    )
;

export const imagesToEntries =
  (
    ...imageEntries
  ) =>
    imageEntries
      .flat()
      .map(fixupDbImage)
      .sort((a, b) => b.width - a.width)
      .reduce(
        (
          acc,
          {
            image_id: key,
            original_name: name,
            creator_id: creatorId,
            created_at,
            ...image
          },
        ) => {
          if (!acc[key]) {
            acc[key] = {
              id: key,
              name,
              creatorId,
              date: new Date(created_at),
              variations: [],
            };
          }

          acc[key].variations.push(image);

          return acc;
        },
        {},
      )
;
