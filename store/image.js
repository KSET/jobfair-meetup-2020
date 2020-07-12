export const state = () => ({});

export const getters = {};

export const mutations = {};

export const actions = {
  async uploadImage(_context, file) {
    const formData = new FormData();
    formData.append("file", file);

    const res =
      await
        this
          .$api
          .$post(
            "/image/upload",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            },
          )
          .catch((res) => res)
    ;

    if (res._csError) {
      return {
        error: true,
        message: res.message,
      };
    } else {
      return {
        error: false,
        images: res,
        data: res,
      };
    }
  },

  async uploadImageWithData({ dispatch }, file) {
    const { error, message, data: images } = await dispatch("uploadImage", file);

    if (error) {
      return {
        error: true,
        errorData: [
          message,
        ],
        data: null,
      };
    }

    return await dispatch("fetchImageVariationInfo", images.default);
  },

  async fetchImageVariationInfo(_context, imageUrl) {
    const url = imageUrl.replace(/^\/api/, "");

    return await this.$api.$get(`${ url }/info`);
  },
};
