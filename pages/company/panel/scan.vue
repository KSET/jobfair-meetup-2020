<template>
  <client-only>
    <div>
      <qrcode-stream
        :camera="camera"
        :class="$style.image"
        :torch="torchActive"
        :track="repaint"
        @decode="onDecode"
        @init="onInit"
      >
        <div
          :class="{
            [$style.messageContainer]: true,
            'd-none': !showOverlay,
          }"
        >
          <div :class="$style.message">
            <v-alert
              v-if="errorMessage"

              elevation="7"
              prominent
              type="error"
              v-text="errorMessage"
            />
            <v-alert
              v-else-if="loading"

              elevation="7"
              prominent
              type="info"
              v-text="'Loading...'"
            />
            <v-alert
              v-else-if="message"

              elevation="7"
              prominent
              type="info"
              v-text="message"
            />
          </div>
        </div>

        <div :class="$style.actions">
          <v-btn
            :disabled="onlyAutoCamera"
            :loading="loading"
            fab
            @click.prevent="switchCamera"
          >
            <v-icon v-if="'back' === camera">
              mdi-camera-front
            </v-icon>
            <v-icon v-else>
              mdi-camera-front
            </v-icon>
          </v-btn>

          <v-btn
            v-if="hasTorch"
            :loading="loading"
            fab
            @click.prevent="torchActive = !torchActive"
          >
            <v-icon v-if="torchActive">
              mdi-flashlight-off
            </v-icon>
            <v-icon v-else>
              mdi-flashlight
            </v-icon>
          </v-btn>
        </div>
      </qrcode-stream>
    </div>
  </client-only>
</template>

<script>
  import {
    mapActions,
  } from "vuex";

  export default {
    name: "PageCompanyScanQrCode",

    data() {
      return {
        loading: false,

        capabilities: {},

        camera: "auto",
        torchActive: false,

        noFrontCamera: false,
        noRearCamera: false,

        message: "",
        errorMessage: "",
      };
    },

    computed: {
      showOverlay() {
        if (this.loading) {
          return true;
        }

        if (this.message) {
          return true;
        }

        if (this.errorMessage) {
          return true;
        }

        return false;
      },

      hasTorch() {
        const { torch } = this.capabilities;

        return Boolean(torch);
      },

      onlyAutoCamera() {
        return this.noFrontCamera && this.noRearCamera && "auto" === this.camera;
      },
    },

    methods: {
      ...mapActions({
        fetchResume: "resume/fetchResumeByUid",
      }),

      switchCamera() {
        const oldCamera = this.camera;

        switch (this.camera) {
          case "front":
            if (!this.noRearCamera) {
              this.camera = "rear";
            }
            break;
          case "rear":
            if (!this.noFrontCamera) {
              this.camera = "front";
            }
            break;
          default:
            this.camera = "rear";
            break;
        }

        if (oldCamera === this.camera) {
          this.camera = "auto";
        }
      },

      repaint(location, ctx) {
        const {
          topLeftCorner,
          topRightCorner,
          bottomLeftCorner,
          bottomRightCorner,
        } = location;

        ctx.strokeStyle = "#ecb000"; // instead of red

        ctx.beginPath();
        ctx.moveTo(topLeftCorner.x, topLeftCorner.y);
        ctx.lineTo(bottomLeftCorner.x, bottomLeftCorner.y);
        ctx.lineTo(bottomRightCorner.x, bottomRightCorner.y);
        ctx.lineTo(topRightCorner.x, topRightCorner.y);
        ctx.lineTo(topLeftCorner.x, topLeftCorner.y);
        ctx.closePath();

        ctx.stroke();
      },

      async onDecode(content) {
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        let uid = null;
        try {
          const { resume_uid: userUid } = JSON.parse(content);
          uid = userUid;
        } catch {
          return null;
        }

        this.turnCameraOff();
        this.message = "Loading info...";

        const { id: resumeId } = await this.fetchResume({ uid });

        if (resumeId) {
          this.message = "Loading user resume...";

          return await this.$router.push({
            name: "PageCompanyResumeDetails",
            params: {
              resumeId,
            },
          });
        }

        this.message = "";
        this.errorMessage = "Unknown user";

        await sleep(3000);

        this.errorMessage = "";
        this.turnCameraOn();
      },

      async onInit(promise) {
        this.loading = true;
        this.errorMessage = "";

        try {
          const { capabilities } = await promise;
          this.$set(this, "capabilities", capabilities);
        } catch (error) {
          const triedFrontCamera = "front" === this.camera;
          const triedRearCamera = "rear" === this.camera;
          const cameraMissingError = "OverconstrainedError" === error.name;

          if (triedRearCamera && cameraMissingError) {
            this.noRearCamera = true;
          }

          if (triedFrontCamera && cameraMissingError) {
            this.noFrontCamera = true;
          }

          switch (error.name) {
            case "NotAllowedError":
              this.errorMessage = "Hey! I need access to your camera!";
              break;
            case "NotFoundError":
              this.errorMessage = "Do you even have a camera on your device?";
              break;
            case "NotSupportedError":
              this.errorMessage = "Seems like this page is served in non-secure context (HTTPS, localhost or file://)";
              break;
            case "NotReadableError":
              this.errorMessage = "Couldn't access your camera. Is it already in use?";
              break;
            case "OverconstrainedError":
              this.errorMessage = "Constraints don't match any installed camera.\nDid you asked for the front camera although there is none?";
              break;
            default:
              this.errorMessage = `UNKNOWN ERROR: ${ error.message }`;
              break;
          }
        } finally {
          this.loading = false;
        }
      },

      turnCameraOn() {
        this.camera = "auto";
      },

      turnCameraOff() {
        this.camera = "off";
      },
    },
  };
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  .image {
    max-width: 100vw;
    max-height: calc(100vh - #{$nav-height});
  }

  .actions {
    position: absolute;
    right: 1em;
    bottom: 1em;
    display: flex;
    flex-direction: column-reverse;

    * + * {
      margin-bottom: 1em;
    }
  }

  .messageContainer {
    font-size: 1.4rem;
    font-weight: bold;
    position: absolute;
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 10px;
    text-align: center;
    background-color: rgba(255, 255, 255, .8);

    .message {
      max-width: 500px;
      margin: 0 auto;

      > * {
        white-space: pre-wrap;
      }
    }
  }
</style>
