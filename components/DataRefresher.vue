<template>
  <div style="display: none;" />
</template>

<script>
  export default {
    data: () => ({
      timers: {},
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

      removeTimers() {
        for (const { timer } of Object.values(this.timers)) {
          clearInterval(timer);
        }
      },
    },
  };
</script>
