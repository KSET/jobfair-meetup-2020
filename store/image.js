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
      };
    }
  },

  async fetchImageVariationInfo(_context, imageUrl) {
    return await this.$api.$get(`${ imageUrl }/info`);
  },
};
