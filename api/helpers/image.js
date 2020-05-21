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
