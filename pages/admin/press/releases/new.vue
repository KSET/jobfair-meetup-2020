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
              <v-menu
                ref="menu"
                v-model="modal"
                :close-on-content-click="false"
                max-width="290px"
                min-width="auto"
                offset-y
                transition="scale-transition"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="dateFormatted"
                    v-bind="attrs"
                    label="Datum"
                    persistent-hint
                    prepend-icon="mdi-calendar"
                    readonly
                    v-on="on"
                    @blur="date = parseDate(dateFormatted)"
                  />
                </template>
                <v-date-picker
                  v-model="date"
                  no-title
                  scrollable
                  @input="modal = false"
                />
              </v-menu>
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
    parseDate,
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

    data(vm) {
      return {
        title: this.$props.release.title,
        date: this.$props.release.date,
        dateFormatted: vm.formatDate(this.$props.release.date),
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

    watch: {
      date() {
        this.dateFormatted = this.formatDate(this.date);
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

      formatDate(date) {
        if (!date) {
          return null;
        }

        return formatDate(date);
      },

      parseDate(formattedDate) {
        if (!formattedDate) {
          return null;
        }

        return parseDate(formattedDate).toISOString();
      },
    },
  };
</script>
