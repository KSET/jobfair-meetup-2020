<template>
  <app-max-width-container>
    <v-row class="mt-12">
      <v-col cols="12">
        <h1 :class="$style.mainHeader">
          <translated-text trans-key="auth.register.title" />
        </h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <pre v-text="formMeta.errorMessage" />
      </v-col>
    </v-row>

    <v-form
      v-model="formMeta.valid"
      :class="$style.form"
      :disabled="formMeta.loading"
      :loading="formMeta.loading"
      lazy-validation
      @submit.prevent="submitForm"
    >
      <v-text-field
        v-for="(value, name) in form"
        :key="name"
        v-model="form[name]"
        :class="$style.required"
        :error-messages="formErrors[name]"
        :label="labels[name].text"
        :placeholder="labels[name].placeholder"
        :type="types[name] || 'text'"
        color="secondary"
        required
        @blur="$v.form[name].$touch()"
        @input="$v.form[name].$touch()"
      />

      <v-btn
        :disabled="!formMeta.valid"
        :loading="formMeta.loading"
        block
        color="secondary"
        type="submit"
      >
        <translated-text
          trans-key="auth.register.submit"
        />
      </v-btn>

      <input style="display: none;" type="submit">
    </v-form>

    <v-snackbar
      v-model="formMeta.snackbar"
      :multi-line="true"
      :timeout="5000"
      color="error darken-1"
      right
      top
      vertical
    >
      <h3 v-text="formMeta.error.title" />
      <ul>
        <li
          v-for="(errors, label) in formMeta.error.errors"
          :key="label"
        >
          {{ label }}
          <ul>
            <li
              v-for="error in errors"
              :key="error"
              v-text="error"
            />
          </ul>
        </li>
      </ul>

      <template v-slot:action="{ attrs }">
        <v-btn
          v-bind="attrs"
          color="white"
          outlined
          @click="formMeta.snackbar = false"
        >
          Zatvori
        </v-btn>
      </template>
    </v-snackbar>
  </app-max-width-container>
</template>

<router>
name: PageRegister
</router>

<script>
  import {
    validationMixin,
  } from "vuelidate";
  import {
    mapActions,
  } from "vuex";
  import {
    registerFormTypes,
    registerFormInputs,
    registerFormLabels,
    registerFormValidations,
  } from "../helpers/auth/register";
  import {
    generateMetadata,
  } from "../helpers/head";
  import TranslatedText from "~/components/TranslatedText";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";
  import {
    decodeRedirectParam,
  } from "~/helpers/url";

  export default {
    name: "PageLogin",

    components: {
      TranslatedText,
      AppMaxWidthContainer,
    },

    mixins: [
      validationMixin,
    ],

    data: () => ({
      formMeta: {
        loading: false,
        valid: true,
        snackbar: false,
        error: {
          title: "",
          errors: [],
        },
      },

      form: registerFormInputs(),

      labels: registerFormLabels(),
      types: registerFormTypes(),
    }),

    validations: {
      form: registerFormValidations(),
    },

    computed: {
      formErrors() {
        return Object.fromEntries(
          Object
            .keys(this.form)
            .filter((key) => key in this.$v.form)
            .map((key) => {
              const $e = this.$v.form[key];

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
    },

    middleware({ store, redirect, route }) {
      const user = store.getters["user/getUser"];

      if (user) {
        const { r } = route.query;
        const redirectTo = decodeRedirectParam(
          r,
          {
            name: "Index",
            params: {},
          },
        );

        return redirect(redirectTo);
      }
    },

    methods: {
      ...mapActions("user", [
        "doRegister",
        "doLogin",
      ]),

      translateError(error, args) {
        switch (error) {
          case "required":
            return "Polje je obavezno";
          case "minLength":
            return `Mora biti minimalno ${ args.min } znakova`;
          case "maxLength":
            return `Mora biti najviše ${ args.max } znakova`;
          case "url":
            return "Mora biti URL (npr https://www.kset.org)";
          case "email":
            return "Mora biti email (npr. info@kset.org)";
          case "sameAs":
            return `Polje mora biti isto kao polje "${ String(this.labels[args.eq]?.text || args.eq).toLowerCase() }"`;
          case "sameAsPassword":
            return "Polje mora biti isto kao polje \"lozinka\"";
          default:
            return error.slice(0, 1).toUpperCase() + error.slice(1);
        }
      },

      async submitForm() {
        this.$v.$touch();
        await this.$nextTick();

        if (!this.formMeta.valid) {
          return;
        }

        const data = this.form;

        this.formMeta.loading = true;
        try {
          const {
            error,
            reason,
            status,
            errorData,
          } = await this.doRegister(data);

          // Error handling
          {
            this.formMeta.snackbar = Boolean(error);

            if (error) {
              if (417 === status) {
                this.formMeta.error.title = reason;
                this.formMeta.error.errors = this.toErrorText(errorData);
              } else {
                this.formMeta.error.title = reason;
                this.formMeta.error.errors = [];
              }

              return;
            }
          }

          // Success!
          {
            const {
              email,
              password,
            } = data;

            await this.doLogin({
              email,
              password,
            });

            return await this.$router.push({
              name: "PageStudentResumeHome",
            });
          }
        } finally {
          this.formMeta.loading = false;
        }
      },

      toErrorText(errorData) {
        const errors = {};
        for (const { field, validation } of errorData) {
          const $e = this.$v.form[field];
          const label = this.labels[field]?.text;

          if (!$e || !label) {
            continue;
          }

          const errorText = this.translateError(validation, $e.$params[field]);

          if (!(label in errors)) {
            errors[label] = [];
          }

          errors[label].push(errorText);
        }

        return errors;
      },
    },

    head: () => ({
      title: "Registracija",
      meta: [
        ...generateMetadata({
          title: "Registracija",
          description: "Registriraj se na Job Fair Meetup",
        }),
      ],
    }),
  };
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  .mainHeader {
    font-size: 250%;
    font-weight: 800;
    text-align: center;
    text-transform: uppercase;
    color: $fer-dark-blue;
  }

  .form {
    max-width: 450px;
    margin: 0 auto;

    > * + * {
      margin-top: 1.5em;
    }
  }

  .required {

    label {

      &::before {
        content: "*";
      }

      &:global(.v-label--active) {
        font-size: 1.2em !important;
        top: 0;

        &::after {
          content: ":";
        }
      }
    }
  }
</style>
