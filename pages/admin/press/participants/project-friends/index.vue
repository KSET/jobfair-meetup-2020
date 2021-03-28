<template>
  <app-max-width-container>
    <v-row>
      <v-col>
        <h1>Prijatelji meetupa</h1>
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
      <v-col
        cols="6"
        md="4"
        offset="3"
        offset-md="4"
      >
        <v-form
          ref="inputForm"
          v-model="form.valid"
          :disabled="form.loading"
          lazy-validation
          @submit.prevent="submitForm"
        >
          <v-card
            :loading="form.loading"
          >
            <v-img
              :alt="form.inputs.name"
              :src="image.url"

              aspect-ratio="1.875"
              contain
            />

            <v-card-title>
              Dodaj novog prijatelja meetupa
            </v-card-title>

            <v-card-text>
              <v-file-input
                v-model="form.inputs.image"
                :accept="allowedMimeTypes"
                :error-messages="formErrors.image"
                label="Slika"
                required
                @blur="$v.form.inputs.image.$touch()"
                @input="$v.form.inputs.image.$touch()"
              />

              <v-text-field
                v-model="form.inputs.link"
                :error-messages="formErrors.link"
                label="URL"
                placeholder="https://www.kset.org"
                required
                @blur="$v.form.inputs.link.$touch()"
                @input="$v.form.inputs.link.$touch()"
              />

              <v-text-field
                v-model="form.inputs.name"
                :error-messages="formErrors.name"
                label="Ime"
                placeholder="Elektrostudent"
                required
                @blur="$v.form.inputs.name.$touch()"
                @input="$v.form.inputs.name.$touch()"
              />
            </v-card-text>

            <v-card-actions>
              <v-spacer />

              <v-btn
                :disabled="!formSubmittable"
                :loading="form.loading"
                color="success"
                @click.prevent="submitForm"
              >
                <v-icon left>
                  mdi-content-save
                </v-icon>
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="friend in sortedFriends"
        :key="friend.id"
        :class="$style.participantCol"
        cols="6"
      >
        <v-card
          :loading="friend.loading"
        >
          <v-card-text class="pa-0 pb-4">
            <v-card
              :class="$style.participantContainer"
              :href="friend.link"
              flat
              rel="noopener noreferrer"
              target="_blank"
              tile
            >
              <v-img
                :lazy-src="friend.images.lazySrc"
                :src="friend.images.srcSet"
                aspect-ratio="1.875"
                contain
              />
            </v-card>
          </v-card-text>


          <v-card-actions>
            <v-btn
              :disabled="friend === firstFriend"
              :loading="friend.loading"
              color="secondary"
              icon
              @click="moveItem(friend, -1)"
            >
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>

            <v-spacer />

            <v-btn
              :loading="friend.loading"
              color="red"
              icon
              @click="deleteFriend(friend)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>

            <v-spacer />

            <v-btn
              :disabled="friend === lastFriend"
              :loading="friend.loading"
              color="secondary"
              icon
              @click="moveItem(friend, 1)"
            >
              <v-icon>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<router>
name: PageAdminProjectFriendsList
</router>

<script>
  import {
    validationMixin,
  } from "vuelidate";
  import {
    maxLength,
    required,
    url,
  } from "vuelidate/lib/validators";
  import {
    mapActions,
  } from "vuex";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";
  import {
    ALLOWED_MIME_TYPES,
  } from "~/helpers/image";
  import {
    formatFriend,
  } from "~/helpers/project-friend";

  const image404 = require("@/assets/images/404.png");

  const defaultInputs = () => ({
    image: null,
    link: "",
    name: "",
  });

  export default {
    components: {
      AppMaxWidthContainer,
    },

    mixins: [
      validationMixin,
    ],

    async asyncData({ store }) {
      const rawProjectFriends = await store.dispatch("projectFriends/fetchAllItems");

      return {
        projectFriends: rawProjectFriends.map(formatFriend(image404)),
        form: {
          valid: true,
          loading: false,
          inputs: defaultInputs(),
        },
        image: {
          url: image404,
          error: "",
        },
      };
    },

    validations: {
      form: {
        inputs: {
          image: {
            required,
          },
          link: {
            required,
            url,
            maxLength: maxLength(511),
          },
          name: {
            required,
            maxLength: maxLength(255),
          },
        },
      },
    },

    computed: {
      allowedMimeTypes() {
        return ALLOWED_MIME_TYPES.join(",");
      },

      allowedMimeTypesSet() {
        return new Set(ALLOWED_MIME_TYPES);
      },

      formSubmittable() {
        return (
          this.form.valid &&
          !this.form.loading
        );
      },

      formErrors() {
        return Object.fromEntries(
          Object
            .keys(this.form.inputs)
            .map((key) => {
              const $e = this.$v.form.inputs[key];

              if (!$e.$error) {
                return [ key, [] ];
              }

              const errors = [];
              for (const { type, ...args } of Object.values($e.$params)) {
                if (!$e[type]) {
                  errors.push(this.translateError(type, args));
                }
              }

              return [ key, errors ];
            })
          ,
        );
      },

      sortedFriends() {
        return (
          [ ...this.projectFriends ]
            .sort((a, b) => a.order - b.order)
        );
      },

      firstFriend() {
        const [ first ] = this.sortedFriends || [];

        return first;
      },

      lastFriend() {
        const list = this.sortedFriends || [];

        if (0 === list.length) {
          return null;
        }

        return list[list.length - 1];
      },
    },

    watch: {
      "form.inputs.image"(file) {
        this.image.error = "";
        this.image.url = image404;

        if (!file) {
          return;
        }

        if (!this.allowedMimeTypesSet.has(file.type)) {
          this.image.error = "Invalid image type.";
          return;
        }

        this.image.url = URL.createObjectURL(file);
      },
    },

    methods: {
      ...mapActions({
        addProjectFriend: "projectFriends/addProjectFriend",
        deleteProjectFriend: "projectFriends/deleteProjectFriend",
        swapProjectFriendsOrder: "projectFriends/swapProjectFriendsOrder",
        fetchAllItems: "projectFriends/fetchAllItems",
      }),

      async refreshFriends() {
        const rawProjectFriends = await this.fetchAllItems() || [];

        this.$set(this, "projectFriends", rawProjectFriends.map(formatFriend(image404)));
      },

      async submitForm() {
        this.$v.$touch();
        await this.$nextTick();

        if (!this.form.valid) {
          return;
        }

        const formData = new FormData();
        for (const [ key, value ] of Object.entries(this.form.inputs)) {
          formData.set(key, value);
        }

        this.form.loading = true;
        try {
          await this.addProjectFriend(formData);
          await this.refreshFriends();
          this.$set(this.form, "inputs", defaultInputs());
          await this.$nextTick();
          this.$v.$reset();
        } finally {
          this.form.loading = false;
        }
      },

      async deleteFriend(friend) {
        friend.loading = true;
        await this.deleteProjectFriend(friend);
        await this.refreshFriends();
        friend.loading = false;
      },

      async moveItem(friend, offset) {
        friend.loading = true;
        try {
          const idx = this.sortedFriends.findIndex((it) => it === friend);
          const other = this.sortedFriends[idx + offset];

          const { id: a } = friend;
          const { id: b } = other;

          other.loading = true;

          const { error, errorData } = await this.swapProjectFriendsOrder({ a, b });

          other.loading = false;
          if (error) {
            const msg =
              Array.isArray(errorData)
                ? errorData.join("\n")
                : "Something went wrong"
            ;

            return alert(msg);
          }

          await this.refreshFriends();
        } finally {
          friend.loading = false;
        }
      },

      translateError(error, args) {
        switch (error) {
          case "required":
            return "Polje je obavezno";
          case "minLength":
            return `Mora biti minimalno ${ args.min } znakova`;
          case "url":
            return "Mora biti URL (npr https://www.kset.org)";
          default:
            return error.slice(0, 1).toUpperCase() + error.slice(1);
        }
      },
    },
  };
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  .participantCol {
    $cols: 5;

    @include media-up(sm) {
      flex: 0 0 #{100% / $cols};
      max-width: #{100% / $cols};
    }

    @include media(sm) {
      padding: 0;
    }
  }
</style>
