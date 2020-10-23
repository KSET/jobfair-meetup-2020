<template>
  <div>
    <v-row>
      <v-col>
        {{ count }}
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-btn
          :loading="loading"
          icon
          @click.stop="increment"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-col>

      <v-col>
        <v-btn
          :loading="loading"
          icon
          @click.stop="decrement"
        >
          <v-icon>mdi-minus</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script>
  export default {
    name: "ReallySecretCounter",

    layout: "spooky-secret-counter-layout",

    async asyncData({ $api }) {
      const { data: count } = await $api.$get("/super-secret-counter/count", { progress: false });

      return {
        count,
      };
    },

    data() {
      return {
        loading: false,

        countTimer: null,
      };
    },

    mounted() {
      this.countTimer = setInterval(() => {
        this.fetchCounter();
      }, 1000);
    },

    beforeDestroy() {
      clearInterval(this.countTimer);
    },

    methods: {
      async increment() {
        const { data } = await this.$api.$post("/super-secret-counter/increment", null, { progress: false });

        this.$set(this, "count", data);
      },

      async decrement() {
        const { data } = await this.$api.$post("/super-secret-counter/decrement", null, { progress: false });

        this.$set(this, "count", data);
      },

      async fetchCounter() {
        const { data } = await this.$api.$get("/super-secret-counter/count", { progress: false });

        this.$set(this, "count", data);
      },
    },
  };
</script>
