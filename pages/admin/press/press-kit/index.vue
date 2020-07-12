<template>
  <app-max-width-container>
    <v-row>
      <v-col cols="12">
        <h1>Press kit</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-btn
          :to="{ name: 'PageAdminPressIndex' }"
        >
          Back
        </v-btn>

        <v-btn
          :loading="itemsLoading"
          class="ml-3"
          @click.native.prevent="refreshPressKits"
        >
          Refresh
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6" order="2" order-md="1">
        <v-expand-transition>
          <v-row
            v-if="itemsLoading"
            key="loader"
          >
            <v-col>
              <h3 class="text-center">
                <v-progress-circular
                  color="primary"
                  indeterminate
                />
              </h3>
            </v-col>
          </v-row>

          <v-row
            v-else
            key="items"
          >
            <v-col
              v-for="item of orderedItems"
              :key="item.id"

              cols="6"
            >
              <v-card flat>
                <jf-press-kit
                  :file-url="item.file.url"
                  :image-url="item.image.variations.default.url"
                  :lazy-image-url="item.image.variations.thumb.url"
                  :title="item.title"
                />

                <v-card-actions class="mt-n2">
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
                    :loading="item.loading"

                    color="error"
                    icon
                    text

                    @click="deleteItem(item)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>

                  <v-spacer />

                  <v-btn
                    :disabled="item === lastItem"
                    :loading="item.loading"

                    color="secondary"
                    icon

                    @click="moveItem(item, 1)"
                  >
                    <v-icon>mdi-arrow-right</v-icon>
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-expand-transition>
      </v-col>

      <v-col cols="12" md="6" order="1" order-md="2">
        <v-row>
          <v-col class="text-center" cols="6" offset="3">
            <h3>Preview:</h3>
            <jf-press-kit
              :file-url="file.url"
              :image-url="image.url"
              :title="title"
            />
          </v-col>
        </v-row>

        <v-form
          ref="form"
          v-model="formValid"
          @submit.prevent="formValid && submitForm()"
        >
          <v-row>
            <v-col>
              <v-text-field
                v-model="title"
                :loading="loading"
                :readonly="loading"
                :rules="inputRules.title"
                label="Naslov"
              />

              <v-file-input
                :disabled="loading || file.loading"
                v-model="file.file"
                :error-messages="file.error"
                :loading="loading || file.loading"
                label="Datoteka"
                required
                show-size
                @dragover.native.prevent
                @drop.native.prevent="setFile(file, $event)"
              />

              <v-file-input
                :disabled="loading || image.loading"
                :error-messages="image.error"
                :loading="loading || image.loading"
                :rules="inputRules.image"
                accept="image/*"
                label="Slika za preview"
                v-model="image.file"
                prepend-icon="mdi-camera-outline"
                required
                show-size
                @dragover.native.prevent
                @drop.native.prevent="setFile(image, $event)"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col class="d-flex">
              <transition name="scroll-x-transition">
                <span
                  v-if="status"
                  class="text-caption font-weight-light text--secondary no-select"
                  v-text="status"
                />
              </transition>

              <v-spacer />

              <v-btn
                :disabled="!formValid"
                :loading="loading"
                class="ml-10"
                color="success"
                @click="submitForm"
              >
                Save
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<script>
  import {
    mapActions,
  } from "vuex";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";
  import JfPressKit from "~/components/press/JfPressKit";

  const image404 = require("@/assets/images/404.svg?inline");

  const fixupItems = (items) => {
    return (
      items
        .map(
          (item) =>
            ({
              ...item,
              loading: false,
            })
          ,
        )
    );
  };

  const emptyFile =
    (placeholderUrl = "#") => ({
      url: placeholderUrl,
      file: null,
      data: null,
      error: "",
      loading: false,
    })
  ;

  const emptyImage =
    () =>
      emptyFile(image404)
  ;

  export default {
    name: "PageAdminPressKitList",

    components: {
      JfPressKit,
      AppMaxWidthContainer,
    },

    async asyncData({ store }) {
      return {
        items: fixupItems(await store.dispatch("pressKit/fetchAllItems")),
        itemsLoading: false,

        title: "",
        image: emptyImage(),
        file: emptyFile(),

        formValid: true,
        loading: false,
        status: "",

        zipLoading: false,

        acceptedImageTypes: [ "image/jpeg", "image/png", "image/gif" ],
      };
    },

    computed: {
      inputRules() {
        return {
          title: [
            (value) => !!value || "Required",
            (value) => (value && 3 <= value.length) || "Min 3 characters",
          ],

          image: [
            (value) => !!value || "Required",
            (value) => (value && this.acceptedImageTypes.includes(value.type)) || "Invalid image",
          ],
        };
      },

      orderedItems() {
        return [ ...this.items ].sort((a, b) => a.order - b.order);
      },

      firstItem() {
        return this.orderedItems[0];
      },

      lastItem() {
        return this.orderedItems.slice(-1).pop();
      },
    },

    watch: {
      "image.file"(file) {
        const object = this.image;

        object.error = "";
        object.url = image404;

        if (!file) {
          return;
        }

        if (!this.acceptedImageTypes.includes(file.type)) {
          object.error = "Invalid image type.";
          return;
        }

        object.loading = true;
        object.url = URL.createObjectURL(file);
        object.loading = false;
      },

      "file.file"(file) {
        const object = this.file;
        object.error = "";

        if (!file) {
          return;
        }

        object.loading = true;
        object.url = URL.createObjectURL(file);
        object.loading = false;
      },
    },

    methods: {
      ...mapActions({
        doUploadImage: "image/uploadImageWithData",
        doUploadFile: "file/uploadFile",
        doCreatePressKit: "pressKit/createPressKit",
        doDeletePressKit: "pressKit/deletePressKit",
        doSwapPressKit: "pressKit/swapPressKit",
        doGeneratePressKit: "pressKit/generateZip",
      }),

      async uploadFile() {
        return await this.doUpload(
          "file",
          this.doUploadFile,
          this.file,
        );
      },

      async uploadImage() {
        return await this.doUpload(
          "image",
          this.doUploadImage,
          this.image,
        );
      },

      async doUploads() {
        if (!(await this.uploadFile())) {
          return false;
        }

        if (!(await this.uploadImage())) {
          return false;
        }

        return true;
      },

      resetInputs() {
        this.title = "";
        this.$set(this, "file", emptyFile());
        this.$set(this, "image", emptyImage());

        this.$refs.form.resetValidation();
      },

      async deleteItem(item) {
        if (!window.confirm(`Are you sure you want to delete "${ item.title }"`)) {
          return;
        }

        item.loading = true;
        const { error, errorData } = await this.doDeletePressKit(item);
        item.loading = false;

        if (error) {
          const msg =
            Array.isArray(errorData)
              ? errorData.join("\n")
              : "Something went wrong"
          ;

          return alert(msg);
        }

        await this.refreshPressKits();
      },

      async createPressKit() {
        this.status = "Creating new kit item...";

        const { error, errorData } = await this.doCreatePressKit({
          title: this.title,
          imageId: this.image.data.image_id,
          fileId: this.file.data.id,
        });

        this.status = "";

        if (error) {
          const message =
            errorData
              ? errorData.join("\n")
              : "Something went wrong"
          ;

          alert(message);
          return false;
        }

        return true;
      },

      async doSubmitForm() {
        if (!(await this.doUploads())) {
          return false;
        }

        if (!(await this.createPressKit())) {
          return false;
        }

        if (!(await this.regenerateZipFile())) {
          return false;
        }

        return true;
      },

      async submitForm() {
        this.loading = true;

        const success = await this.doSubmitForm();

        this.loading = false;

        if (!success) {
          return false;
        }

        this.resetInputs();
        await this.refreshPressKits();

        return true;
      },

      setFile(object, dropEvent) {
        const file = Array.from(dropEvent.dataTransfer.files).pop();

        if (!file) {
          return;
        }

        object.file = file;
      },

      async doUpload(objectName, uploadFn, object) {
        try {
          this.status = `Uploading ${ objectName }...`;
          const { error, errorData, data } = await uploadFn(object.file);
          this.status = "";

          if (error) {
            object.error =
              errorData
                ? errorData.join("\n")
                : "Something went wrong"
            ;

            return false;
          }

          object.data = data;

          return true;
        } catch (e) {
          console.error(e);
          return false;
        }
      },

      async refreshPressKits() {
        this.itemsLoading = true;
        const kits = fixupItems(await this.$store.dispatch("pressKit/fetchAllItems"));

        this.$set(this, "items", kits);
        this.itemsLoading = false;
      },

      async regenerateZipFile() {
        this.zipLoading = true;
        this.status = "Generating zip...";

        const { error, errorData } = await this.doGeneratePressKit();

        this.status = "";
        this.zipLoading = false;

        if (error) {
          const msg =
            Array.isArray(errorData)
              ? errorData.join("\n")
              : "Something went wrong"
          ;

          alert(msg);
          return false;
        }

        return true;
      },

      async moveItem(item, offset) {
        item.loading = true;

        try {
          const idx = this.orderedItems.findIndex((it) => it === item);
          const other = this.orderedItems[idx + offset];

          const { id: a } = item;
          const { id: b } = other;

          other.loading = true;

          const { error, errorData } = await this.doSwapPressKit({ a, b });

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

<style lang="scss" module>
  @import "../../../../assets/styles/include/all";
</style>
