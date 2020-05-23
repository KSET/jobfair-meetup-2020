export const state = () => ({});

export const getters = {};

export const mutations = {};

export const actions = {
  async uploadFile(_context, file) {
    const formData = new FormData();
    formData.append("file", file);

    return (
      await
        this
          .$api
          .$post(
            "/file/upload",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            },
          )
          .catch((res) => res)
    );
  },

  async fetchFileInfo(_context, fileUrl) {
    return await this.$api.$get(`${ fileUrl }/info`);
  },
};
