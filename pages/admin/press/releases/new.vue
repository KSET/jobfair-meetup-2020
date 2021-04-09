<template>
  <app-max-width-container>
    <v-row>
      <v-col cols="12">
        <h1>New press release</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-form v-model="formValid">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="title"
                label="Naslov"
                required
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-dialog
                ref="dialog"
                v-model="modal"
                :return-value.sync="date"
                persistent
                width="290px"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="date"
                    v-bind="attrs"
                    label="Picker in dialog"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-on="on"
                  />
                </template>
                <v-date-picker
                  v-model="date"
                  scrollable
                >
                  <v-spacer />
                  <v-btn
                    color="primary"
                    text
                    @click="modal = false"
                  >
                    Cancel
                  </v-btn>
                  <v-btn
                    color="primary"
                    text
                    @click="$refs.dialog.save(date)"
                  >
                    OK
                  </v-btn>
                </v-date-picker>
              </v-dialog>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-file-input
                v-model="file"
                clearable
                label="Datoteka"
                required
                show-size
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <div class="d-flex">
                <v-btn
                  :loading="loading"
                  :to="{ name: 'PageAdminPressReleaseList' }"
                  color="warning"
                >
                  <v-icon left>
                    mdi-cancel
                  </v-icon>
                  Cancel
                </v-btn>

                <v-spacer />

                <v-btn
                  :disabled="!allValid"
                  :loading="loading"
                  color="success"
                  @click.prevent="doSave"
                >
                  <v-icon left>
                    mdi-content-save
                  </v-icon>
                  Save
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<router>
name: PageAdminPressReleaseCreate
</router>

<script>
  import {
    mapActions,
  } from "vuex";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";
  import {
    formatDate,
  } from "~/helpers/date";

  export default {
    name: "PageAdminPressReleaseCreate",

    components: {
      AppMaxWidthContainer,
    },

    props: {
      release: {
        required: false,
        type: Object,
        default: () => ({
          title: "",
          fileId: null,
          date: new Date().toISOString(),
        }),
      },
    },

    data() {
      return {
        title: this.$props.release.title,
        date: formatDate(this.$props.release.date),
        modal: false,
        file: null,
        fileId: this.$props.release.fileId,
        formValid: true,
        loading: false,
      };
    },

    computed: {
      id() {
        const { id } = this.$props.release;

        if (!id) {
          return null;
        }

        return id;
      },

      allValid() {
        if (!this.formValid) {
          return false;
        }

        if (this.fileId) {
          return true;
        }

        return null !== this.file;
      },

      saveHandler() {
        if (!this.id) {
          return this.createPressRelease;
        } else {
          return this.updatePressRelease;
        }
      },
    },

    methods: {
      ...mapActions({
        uploadFile: "file/uploadFile",
        createPressRelease: "pressRelease/createPressRelease",
        updatePressRelease: "pressRelease/updatePressRelease",
      }),

      async doSave() {
        this.loading = true;

        try {
          if (this.file) {
            const { error, data: file, errorData } = await this.uploadFile(this.file);

            if (error) {
              const errors = errorData || [ "Something went wrong" ];
              alert(errors.join("\r\n"));
              return;
            }

            this.fileId = file.id;
          }

          {
            const { error, errorData } = await this.saveHandler({
              id: this.id,
              title: this.title,
              fileId: this.fileId,
              date: this.date,
            });

            if (error) {
              const errors = errorData || [ "Something went wrong" ];
              alert(errors.join("\r\n"));
              return;
            }

            await this.$router.push({ name: "PageAdminPressReleaseList" });
          }
        } finally {
          this.loading = false;
        }
      },
    },
  };
</script>
