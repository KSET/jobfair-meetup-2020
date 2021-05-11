<template>
  <div
    v-if="show"
    :class="$style.container"
  >
    <v-tooltip right>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          color="warning"
          elevation="2"
          fab
          small
          v-on="on"
        >
          <v-icon>mdi-exclamation-thick</v-icon>
        </v-btn>
      </template>

      <span v-text="errorMessage" />
    </v-tooltip>
  </div>
</template>

<script>
  import {
    mapActions,
    mapGetters,
  } from "vuex";

  export default {
    data: () => ({
      timer: null,
      isOnline: true,
    }),

    computed: {
      ...mapGetters("meta/health", [
        "isLive",
      ]),

      show() {
        return !this.isLive;
      },

      errorMessage() {
        if (!this.isOnline) {
          return "Trenutno ste offline. Molimo spojite se na internet";
        }

        if (!this.isLive) {
          return "JobFair je trenutno nedostupan. Stranica radi u reduciranom kapacitetu";
        }

        return "Nešto je pošlo po zlu. Molimo budite strpljivi dok otklanjamo poteškoće";
      },
    },

    mounted() {
      this.timer = setInterval(
        () =>
          this.fetchLiveStatus()
        ,
        4000 + 2000 * Math.random(),
      );

      const setOnline = (toStatus) => () => {
        this.isOnline = Boolean(toStatus);
      };

      window.addEventListener("online", setOnline(true));
      window.addEventListener("offline", setOnline(false));
    },

    beforeDestroy() {
      clearInterval(this.timer);
    },

    methods: {
      ...mapActions("meta/health", [
        "fetchLiveStatus",
      ]),
    },
  };
</script>

<style lang="scss" module>
  .container {
    position: fixed;
    z-index: 999;
    bottom: 1em;
    left: 1em;
  }
</style>
