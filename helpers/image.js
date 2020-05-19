export const getSrcSet = (imageList) => {
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
