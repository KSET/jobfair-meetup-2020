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
        Use your JobFair credentials
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
            :rules="validationRules.email"
            label="Email"
            light
            required
          />
          <v-text-field
            v-model="password"
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
  } from "vuex";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";

  export default {
    name: "PageLogin",

    components: {
      AppMaxWidthContainer,
    },

    data: () => ({
      isValid: false,
      isLoading: false,
      hasError: false,
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

    methods: {
      ...mapActions({
        doLogin: "user/doLogin",
      }),

      async login() {
        const { email, password } = this;

        this.hasError = false;
        this.isLoading = true;
        const success = await this.doLogin({ email, password });
        this.isLoading = false;

        const { r } = this.$route.query;

        if (!success) {
          this.hasError = true;
          return;
        }

        const redirectTo = {
          name: "Index",
          params: {},
        };

        if (r) {
          try {
            const [ name, params ] = JSON.parse(Buffer.from(r, "base64").toString("binary"));

            Object.assign(
              redirectTo,
              {
                name,
                params,
              },
            );
          } catch (e) {
          }
        }

        return await this.$router.push(redirectTo);
      },
    },
  };
</script>
