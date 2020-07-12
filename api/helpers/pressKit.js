import {
  join as pathJoin,
} from "path";
import {
  localFolderPath,
} from "./file";

export const zipLocation =
  () =>
    pathJoin(
      localFolderPath(),
      "press-kit.zip",
    )
;
