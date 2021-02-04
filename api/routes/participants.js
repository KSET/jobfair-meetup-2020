import {
  join as joinPath,
} from "path";
import {
  registerRoutesInFolder,
} from "../helpers/route";

export default registerRoutesInFolder(joinPath(__dirname, "participants"));
