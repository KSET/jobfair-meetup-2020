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
