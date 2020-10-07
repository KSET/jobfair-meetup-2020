<template>
  <app-max-width-container>
    <v-row>
      <v-col>
        <h1>Gallery</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-btn
          :to="{ name: 'PageAdminPressIndex' }"
        >
          <v-icon left>
            mdi-arrow-left
          </v-icon>
          Back
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6" order="2" order-md="1">
        <v-row>
          <v-col
            v-for="item in postList"
            :key="item.id"
            cols="6"
          >
            <v-card :loading="item.loading">
              <v-img
                :src="item.images.default"
                aspect-ratio="1.78"
                cover
              />
              <v-card-title>{{ item.title }}</v-card-title>
              <v-card-text>{{ item.description }}</v-card-text>
              <v-card-actions>
                <v-btn
                  :disabled="item === firstItem"
                  :loading="item.loading"
                  color="secondary"
                  icon
                  @click="moveItem(item, -1)"
                >
                  <v-icon>mdi-arrow-left</v-icon>
                </v-btn>

                <v-spacer />

                <v-btn
                  :disabled="item.editing"
                  :loading="item.loading"
                  color="warning"
                  icon
                  @click="doSelectItem(item)"
                >
                  <v-icon>mdi-image-edit</v-icon>
                </v-btn>

                <v-btn
                  :loading="item.loading"
                  color="error"
                  icon
                  @click="doDeleteItem(item)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>

                <v-spacer />

                <v-btn
                  :disabled="item === lastItem"
                  :loading="item.loading"
                  color="secondary"
                  icon
                  @click="moveItem(item, +1)"
                >
                  <v-icon>mdi-arrow-right</v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12" md="6" order="1" order-md="2">
        <v-row>
          <v-col cols="6">
            <v-card>
              <v-img
                :src="fileUrl"
                aspect-ratio="1.78"
                class="ma-2"
                cover
              />

              <v-card-title>
                <v-file-input
                  v-model="file"
                  :disabled="loading"
                  :error-messages="fileError"
                  :loading="loading"
                  dense
                  label="Slika"
                />
              </v-card-title>

              <v-card-subtitle>
                <v-text-field
                  v-model="post.title"
                  :disabled="loading"
                  :loading="loading"
                  label="Naslov"
                />
              </v-card-subtitle>

              <v-card-text>
                <v-textarea
                  v-model="post.description"
                  :disabled="loading"
                  :loading="loading"
                  auto-grow
                  dense
                  label="Opis"
                  rows="1"
                />
              </v-card-text>

              <v-card-actions>
                <v-btn
                  :disabled="loading"
                  :loading="loading"
                  color="warning"
                  @click.prevent="clearInputs"
                >
                  <v-icon left>
                    mdi-cancel
                  </v-icon>
                  Cancel
                </v-btn>

                <v-spacer />

                <v-btn
                  :disabled="!formValid || loading"
                  :loading="loading"
                  color="success"
                  @click.prevent="doSave"
                >
                  <v-icon left>
                    mdi-content-save
                  </v-icon>
                  Save
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<router>
name: PageAdminPressGalleryList
</router>

<script>
  import {
    mapActions,
  } from "vuex";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";

  const image404 = require("@/assets/images/404.png");

  const fixupItems = (items) => {
    return (
      items
        .map(
          (item) =>
            ({
              ...item,
              loading: false,
              editing: false,
            })
          ,
        )
    );
  };

  const defaultPost = () => ({
    id: null,
    imageId: null,
    title: "",
    description: "",
  });

  export default {
    name: "PageAdminPressGalleryList",

    components: {
      AppMaxWidthContainer,
    },

    async asyncData({ store }) {
      return {
        items: fixupItems(await store.dispatch("gallery/fetchAllItems")),
      };
    },

    data: () => ({
      loading: false,

      post: defaultPost(),

      file: null,
      fileUrl: image404,
      fileError: "",

      acceptedImageTypes: [ "image/jpeg", "image/png", "image/gif" ],
    }),

    computed: {
      postList() {
        return [ ...this.items ].sort(({ order: a }, { order: b }) => a - b);
      },

      formValid() {
        const { file } = this;
        const { title, description } = this.post;

        return file && title && description;
      },

      firstItem() {
        return this.postList[0];
      },

      lastItem() {
        return this.postList.slice(-1).pop();
      },
    },

    watch: {
      file(file) {
        this.fileError = "";
        this.fileUrl = image404;

        if (!file) {
          return;
        }

        if (!this.acceptedImageTypes.includes(file.type)) {
          this.fileError = "Invalid image type.";
          return;
        }

        this.fileUrl = URL.createObjectURL(file);
      },
    },

    methods: {
      ...mapActions({
        uploadImage: "image/uploadImage",
        imageInfo: "image/fetchImageVariationInfo",
        updateGallery: "gallery/updateGallery",
        deleteGallery: "gallery/deleteGallery",
        swapGallery: "gallery/swapGallery",
        listGalleryItems: "gallery/fetchAllItems",
      }),

      async doRefreshGallery() {
        this.$set(this, "items", fixupItems(await this.listGalleryItems()));
      },

      async doDeleteItem(item) {
        if (!window.confirm("Are you sure you want to delete the image?")) {
          return;
        }

        item.loading = true;

        try {
          const { error, errorData } = await this.deleteGallery(item);

          if (error) {
            const msg =
              Array.isArray(errorData)
                ? errorData.join("\n")
                : "Something went wrong"
            ;

            return alert(msg);
          }

          await this.doRefreshGallery();
        } finally {
          item.loading = false;
        }
      },

      clearEditing() {
        for (const item of this.postList) {
          item.editing = false;
        }
      },

      doSelectItem(item) {
        const { id, title, description, imageId, images } = item;

        this.clearEditing();

        item.editing = true;

        this.fileUrl = images.default;
        this.$set(this, "post", { id, title, description, imageId });
      },

      clearInputs() {
        this.clearEditing();

        this.$set(this, "post", defaultPost());

        this.file = null;
        this.fileUrl = image404;
      },

      async doUpload() {
        const { error, message, images } = await this.uploadImage(this.file);

        if (error) {
          this.fileError =
            message || "Something went wrong while uploading the picture"
          ;

          return false;
        }

        const { error: err, data } = await this.imageInfo(images.default);

        if (err) {
          this.fileError = "Something went wrong while uploading the picture";
        }

        this.post.imageId = data.image_id;

        return true;
      },

      async doSave() {
        try {
          this.loading = true;
          this.fileError = "";

          if (this.file && !this.post.imageId) {
            await this.doUpload();
          }

          const { error, errorData } = await this.updateGallery(this.post);

          if (error) {
            const msg =
              Array.isArray(errorData)
                ? errorData.join("\n")
                : "Something went wrong"
            ;

            return alert(msg);
          }

          await this.clearInputs();
          await this.doRefreshGallery();
        } finally {
          this.loading = false;
        }
      },

      async moveItem(item, offset) {
        item.loading = true;

        try {
          const idx = this.postList.findIndex((it) => it === item);
          const other = this.postList[idx + offset];

          const { id: a } = item;
          const { id: b } = other;

          other.loading = true;

          const { error, errorData } = await this.swapGallery({ a, b });

          other.loading = false;

          if (error) {
            const msg =
              Array.isArray(errorData)
                ? errorData.join("\n")
                : "Something went wrong"
            ;

            return alert(msg);
          }

          const tmp = item.order;

          item.order = other.order;
          other.order = tmp;
        } finally {
          item.loading = false;
        }
      },
    },
  };
</script>
