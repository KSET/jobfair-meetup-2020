const partnerSrc =
  (defaultImage, images) =>
    images
      .find((image) => "default" === image.name)
      .url
;

const partnerLazySrc =
  (defaultImage, images) => {
    const [
      smallest = {},
    ] = images.sort((a, b) => a.width - b.width);

    return smallest.url;
  };

export const formatPartner = (defaultImage) => ({ images, ...partner }) => ({
  ...partner,
  loading: false,
  images: {
    srcSet: partnerSrc(defaultImage, images),
    lazySrc: partnerLazySrc(defaultImage, images),
  },
});
