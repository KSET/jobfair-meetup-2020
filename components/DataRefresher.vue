<template>
  <div style="display: none;" />
</template>

<script>
  export default {
    data: () => ({
      timers: {},
      listeners: {},
    }),

    beforeDestroy() {
      this.removeTimers();
    },

    mounted() {
      this.addTimer(
        "youtubeLiveCheck",
        () => this.$store.dispatch("external/live/fetchYoutubeLiveVideoId"),
        14000 + 2000 * Math.random(),
      );

      this.addTimer(
        "jobFairLiveCheck",
        () => this.$store.dispatch("meta/health/fetchLiveStatus"),
        4000 + 2000 * Math.random(),
      );

      const setOnline = (toStatus) => () => {
        this.$store.commit("meta/health/SET_ONLINE", Boolean(toStatus));
      };

      this.addListener("online", setOnline(true));
      this.addListener("offline", setOnline(false));
    },

    methods: {
      addTimer(key, fn, timeout = 10000) {
        this.$set(
          this.timers,
          key,
          {
            timeout,
            fn,
            timer: setInterval(() => fn(), timeout),
          },
        );
      },

      addListener(event, fn) {
        const oldListener = this.listeners[event];
        if (oldListener) {
          window.removeEventListener(event, oldListener);
        }

        this.$set(this.listeners, "event", fn);

        window.addEventListener(event, fn);
      },

      removeTimers() {
        for (const { timer } of Object.values(this.timers)) {
          clearInterval(timer);
        }
      },

      removeListeners() {
        for (const [ type, listener ] of Object.entries(this.listeners)) {
          window.removeEventListener(type, listener);
        }
      },
    },
  };
</script>
