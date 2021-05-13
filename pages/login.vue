<template>
  <app-max-width-container class="py-12 align-self-center">
    <v-card
      v-if="isLive"
      class="mx-auto pa-4"
      light
      max-width="600"
    >
      <v-card-title>
        Prijava
      </v-card-title>
      <v-card-subtitle>
        Iskoristi Job Fair email i lozinku za prijavu (s <a :href="loginUrlHref" rel="noopener noreferrer" style="color: inherit;" target="_blank">{{ loginUrlName }}</a>)
      </v-card-subtitle>
      <v-card-text>
        <v-form
          ref="form"
          v-model="isValid"
          light
          @submit.prevent="isValid && login()"
        >
          <v-text-field
            v-model="email"
            :disabled="isLoading"
            :loading="isLoading"
            :rules="validationRules.email"
            label="Email"
            light
            required
          />
          <v-text-field
            v-model="password"
            :disabled="isLoading"
            :loading="isLoading"
            :rules="validationRules.password"
            label="Lozinka"
            light
            required
            type="password"
          />
          <input style="display: none;" type="submit">
        </v-form>
      </v-card-text>
      <v-card-actions>
        <transition name="scroll-x-transition">
          <span
            v-if="showTimeError"
            class="font-weight-light ml-3 no-select"
          >
            Zahtjev se još procesira...
          </span>
          <span
            v-else
            class="ml-3"
          >
            <a
              :href="`${loginUrlHref}/users/sign_up?locale=hr`"
              class="font-weight-light black--text"
              target="_blank"
            >
              Registracija
            </a>

            <v-divider class="my-1" style="opacity: .2;" />

            <a
              :href="`${loginUrlHref}/users/password/new?locale=hr`"
              class="font-weight-light black--text"
              target="_blank"
            >
              Zaboravili ste lozinku?
            </a>
          </span>
        </transition>

        <v-btn
          :disabled="!isValid"
          :loading="isLoading"
          class="ml-auto"
          color="primary"
          light
          x-large
          @click="login"
        >
          <v-icon left>
            mdi-login-variant
          </v-icon>
          Prijava
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-card
      v-else
      class="mx-auto pa-4"
      light
      max-width="600"
    >
      <v-card-title>Prijava</v-card-title>

      <v-card-text>
        Aplikacija je trenutno u reduciranom stanju rada. Prijava je nedostupna.
      </v-card-text>
    </v-card>

    <v-snackbar
      v-model="hasError"
      :timeout="5000"
      color="error"
      right
      top
    >
      <span v-text="errorMessage" />

      <v-btn
        light
        text
        @click="hasError = false"
      >
        Zatvori
      </v-btn>
    </v-snackbar>
  </app-max-width-container>
</template>

<router>
name: PageLogin
</router>

<script>
  import {
    mapActions,
    mapGetters,
  } from "vuex";
  import {
    generateMetadata,
  } from "../helpers/head";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";
  import {
    decodeRedirectParam,
  } from "~/helpers/url";

  export default {
    name: "PageLogin",

    components: {
      AppMaxWidthContainer,
    },

    data: () => ({
      isValid: false,
      isLoading: false,
      hasError: false,
      errorReason: "",
      showTimeError: false,
      timer: null,
      email: "",
      password: "",
      validationRules: {
        email: [
          (v) => !!v || "Email je obavezan",
          (v) => /.+@.+\..+/.test(v) || "Email mora biti valjan",
        ],
        password: [
          (v) => !!v || "Lozinka je obavezna",
        ],
      },
    }),

    computed: {
      ...mapGetters({
        user: "user/getUser",
        isModerator: "user/isModerator",
        getSetting: "settings/getSetting",
        isLive: "meta/health/isLive",
      }),

      loginUrlHref() {
        const url = this.getSetting("GraphQL Endpoint") || process.env.JOBFAIR_GRAPHQL_ENDPOINT;
        const parsedUrl = new URL(url);

        return parsedUrl.origin;
      },

      loginUrlName() {
        const parsedUrl = new URL(this.loginUrlHref);

        return parsedUrl.hostname;
      },

      errorMessage() {
        switch (this.errorReason) {
          case "application-offline":
            return "Aplikacija je trenutno u reduciranom stanju rada. Prijava je nedostupna.";
          default:
            return "Neispravni email ili lozinka";
        }
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
      ...mapActions({
        doLogin: "user/doLogin",
        fetchAdminPages: "adminPages/fetchPages",
      }),

      async login() {
        const { email, password } = this;
        const startTimer =
          () =>
            setTimeout(
              () => {
                this.showTimeError = true;
              },
              1500,
            )
        ;

        this.hasError = false;
        this.isLoading = true;
        this.showTimeError = false;
        this.timer = startTimer();

        const { error, reason } = await this.doLogin({ email, password });

        clearTimeout(this.timer);
        this.showTimeError = false;
        this.isLoading = false;

        if (error) {
          this.hasError = true;
          this.errorReason = reason;
          return;
        }

        if (this.isModerator) {
          await this.fetchAdminPages({ userRole: this.user.role });
        }

        const { r } = this.$route.query;
        const redirectTo = decodeRedirectParam(
          r,
          {
            name: "Index",
            params: {},
          },
        );

        const redirectUrl = this.$router.resolve(redirectTo).href;

        return await window.location.assign(redirectUrl);
      },
    },

    head() {
      const title = "Prijava";

      return {
        title,
        meta: [
          ...generateMetadata({
            title,
          }),
        ],
      };
    },
  };
</script>
