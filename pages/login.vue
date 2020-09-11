<template>
  <app-max-width-container class="py-12 align-self-center">
    <v-card
      class="mx-auto pa-4"
      light
      max-width="600"
    >
      <v-card-title>
        Login
      </v-card-title>
      <v-card-subtitle>
        Use your JobFair credentials (from <a style="color: inherit;" target="_blank" rel="noopener noreferrer" :href="loginUrlHref">{{ loginUrlName }}</a>)
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
            label="Password"
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
            Still processing...
          </span>
        </transition>

        <v-btn
          :disabled="!isValid"
          :loading="isLoading"
          class="ml-auto"
          color="success"
          light
          x-large
          @click="login"
        >
          Login
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
      Invalid username or password
      <v-btn
        light
        text
        @click="hasError = false"
      >
        Close
      </v-btn>
    </v-snackbar>
  </app-max-width-container>
</template>

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
          (v) => !!v || "Email is required",
          (v) => /.+@.+\..+/.test(v) || "Email must be valid",
        ],
        password: [
          (v) => !!v || "Password is required",
        ],
      },
    }),

    computed: {
      ...mapGetters({
        user: "user/getUser",
        isModerator: "user/isModerator",
        getSetting: "settings/getSetting",
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

        const success = await this.doLogin({ email, password });

        clearTimeout(this.timer);
        this.showTimeError = false;
        this.isLoading = false;

        if (!success) {
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

        return await this.$router.push(redirectTo);
      },
    },
  };
</script>
