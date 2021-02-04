const friendSrc =
  (defaultImage, images) =>
    images
      .find((image) => "default" === image.name)
      .url
;

const friendLazySrc =
  (defaultImage, images) => {
    const [
      smallest = {},
    ] = images.sort((a, b) => a.width - b.width);

    return smallest.url;
  };

export const formatFriend = (defaultImage) => ({ images, ...partner }) => ({
  ...partner,
  loading: false,
  images: {
    srcSet: friendSrc(defaultImage, images),
    lazySrc: friendLazySrc(defaultImage, images),
  },
});
