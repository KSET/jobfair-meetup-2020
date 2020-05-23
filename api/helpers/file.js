import {
  join as joinPath,
} from "path";

export const apiFilePath =
  ({ fileId }) =>
    `/api/file/resource/${ fileId }`
;

export const localFolderPath =
  () =>
    joinPath(
      process.cwd(),
      "uploads",
      "files",
    )
;

export const localFilePath =
  ({ md5, name }) =>
    joinPath(
      localFolderPath(),
      `${ md5 }.${ name }`,
    )
;
