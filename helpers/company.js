import {
 dotGet,
} from "./data";
import {
  keysFromSnakeToCamelCase,
  pipe,
} from "./object";

const fixCompanyKeys =
  ({
     name,
     brandName,
     shortDescription: description,
     logo,
     ...rest
   }) =>
    ({
      name: brandName || name,
      legalName: name,
      brandName,
      description,
      image: dotGet(logo, "large.url"),
      thumbnail: dotGet(logo, "small.url"),
      images: logo,
      ...rest,
    })
;

export const fixCompany =
  pipe(
    keysFromSnakeToCamelCase,
    fixCompanyKeys,
  )
;
