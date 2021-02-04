import {
  dotGet,
} from "./data";
import {
  isObject,
} from "./object";

export const getSrcSet = (imageList) => {
  if (!isObject(imageList)) {
    return imageList;
  }

  return (
    Object
      .values(imageList)
      .map(
        ({ width, url }) =>
          `${ url } ${ width }w`
        ,
      )
      .join(",")
  );
};

export const getSrcWithWidth =
  (
    images,
    minWidth,
  ) => {
    const defaultSrc = () => dotGet(images, "original.url");
    const candidateImage =
      Object
        .values(images)
        .sort(
          (a, b) =>
            a.width - b.width
          ,
        )
        .find(
          ({ width }) =>
            width >= minWidth
          ,
        )
    ;

    return dotGet(candidateImage, "url", defaultSrc);
  }
;


export const EXTENSION_MAP = {
  "image/gif": "gif",
  "image/png": "png",
  "image/jpeg": "jpg",
};
export const ALLOWED_MIME_TYPES = Object.keys(EXTENSION_MAP);


export const MAX_IMAGE_SIZE__MB = 7;
export const MAX_IMAGE_SIZE__KB = MAX_IMAGE_SIZE__MB * 1024;
export const MAX_IMAGE_SIZE__B = MAX_IMAGE_SIZE__KB * 1024;
