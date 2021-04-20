<template>
  <app-max-width-container class="py-12 align-self-center">
    <v-card
      class="mx-auto pa-4"
      light
      max-width="600"
    >
      <v-card-title>
        Prijava
      </v-card-title>
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
          <nuxt-link
            v-else
            class="font-weight-light ml-3 black--text"
            :to="{ name: 'PageRegister' }"
          >
            Registriraj se
          </nuxt-link>
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
    <v-snackbar
      v-model="hasError"
      :timeout="5000"
      color="error"
      right
      top
    >
      Neispravni email ili lozinka
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
      }),
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

        const user = await this.doLogin({ email, password });

        clearTimeout(this.timer);
        this.showTimeError = false;
        this.isLoading = false;

        if (!user) {
          this.hasError = true;
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
  };
</script>
