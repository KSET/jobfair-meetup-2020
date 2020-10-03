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
