<template>
  <client-only>
    <div>
      <p>
        Last result: <b>{{ decodedContent }}</b>
      </p>

      <p class="error">
        {{ errorMessage }}
      </p>

      <qrcode-stream @decode="onDecode" @init="onInit" />
    </div>
  </client-only>
</template>

<script>
  export default {
    name: "PageCompanyScanQrCode",

    data() {
      return {
        decodedContent: "",
        errorMessage: "",
      };
    },

    methods: {
      onDecode(content) {
        this.decodedContent = content;
      },

      onInit(promise) {
        promise
          .then(() => {
            console.log("Successfully initilized! Ready for scanning now!");
          })
          .catch((error) => {
            if ("NotAllowedError" === error.name) {
              this.errorMessage = "Hey! I need access to your camera";
            } else if ("NotFoundError" === error.name) {
              this.errorMessage = "Do you even have a camera on your device?";
            } else if ("NotSupportedError" === error.name) {
              this.errorMessage = "Seems like this page is served in non-secure context (HTTPS, localhost or file://)";
            } else if ("NotReadableError" === error.name) {
              this.errorMessage = "Couldn't access your camera. Is it already in use?";
            } else if ("OverconstrainedError" === error.name) {
              this.errorMessage = "Constraints don't match any installed camera. Did you asked for the front camera although there is none?";
            } else {
              this.errorMessage = `UNKNOWN ERROR: ${ error.message }`;
            }
          })
        ;
      },
    },
  };
</script>
