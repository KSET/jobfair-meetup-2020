<template>
  <client-only>
    <div>
      <v-row>
        <v-col cols="12">
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
                v-if="!onlyAutoCamera"
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
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <div class="px-2">
            <v-select
              v-model="selectedEventId"
              :items="selectItems"
              label="Event"
              solo
            />
          </div>
        </v-col>
      </v-row>

      <v-dialog
        :value="resume"
        persistent
        width="80vw"
      >
        <v-card
          v-if="resume"
          :loading="resumeLoading"
        >
          <v-card-title
            v-text="resume.fullName"
          />

          <v-card-subtitle
            v-text="resume.phone"
          />

          <v-card-subtitle>
            <span class="font-weight-bold">Event:</span> [{{ selectedEvent.company.name }}] {{ selectedEvent.title }}
          </v-card-subtitle>

          <v-card-subtitle>
            <span class="font-weight-bold">Ima rezervaciju:</span>
            <v-icon v-if="resume.hasReservation" color="success">
              mdi-check
            </v-icon>
            <v-icon v-else color="error">
              mdi-close
            </v-icon>
          </v-card-subtitle>

          <v-card-subtitle>
            <span class="font-weight-bold">Rezervirana mjesta:</span> {{ resume.eventSlots.filled }} / {{ resume.eventSlots.total }} ({{ resume.eventSlots.free }} slobodnih)
          </v-card-subtitle>

          <v-card-subtitle>
            <span class="font-weight-bold">Propušteni ljudi:</span> {{ resume.logEntries.length }} / {{ resume.eventSlots.total }}
          </v-card-subtitle>

          <v-card-subtitle v-if="resume.alreadyEntered">
            <v-alert type="error">
              Već propušten
            </v-alert>
          </v-card-subtitle>

          <v-card-actions>
            <v-btn
              :loading="resumeLoading"
              color="warning"
              x-large
              @click="resume = null"
            >
              Zatvori
            </v-btn>

            <v-spacer />

            <v-btn
              :loading="resumeLoading"
              color="success"
              x-large
              @click.stop="approveEntry"
            >
              Odobri ulaz
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </client-only>
</template>

<router>
name: PageGateGuardianScanQrCode
</router>

<script>
  import {
    mapActions,
  } from "vuex";
  import {
    getParticipantCapacityFor,
  } from "~/components/student/event-status";
  import {
    dotGet,
  } from "~/helpers/data";

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  export default {
    name: "PageCompanyScanQrCode",

    async asyncData({ store }) {
      const events = await store.dispatch("companies/fetchParticipantEvents");

      return {
        events: Object.fromEntries(events.map((event) => [ event.id, event ])),
        selectedEventId: dotGet(events, "0.id"),
      };
    },

    data() {
      return {
        loading: false,

        capabilities: {},

        camera: "rear",
        torchActive: false,

        noFrontCamera: false,
        noRearCamera: false,

        message: "",
        errorMessage: "",

        resume: null,
        resumeLoading: false,
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

      selectItems() {
        return (
          Object
            .values(this.events)
            .map(
              ({ title, id }) =>
                ({
                  text: title,
                  value: id,
                })
              ,
            )
            .sort(
              (a, b) =>
                b.date - a.date
              ,
            )
        );
      },

      selectedEvent() {
        if (!this.selectedEventId) {
          return null;
        }

        return this.events[this.selectedEventId];
      },

      eventKey() {
        const { selectedEvent, resume } = this;

        return {
          eventId: dotGet(selectedEvent, "id"),
          eventType: dotGet(selectedEvent, "type"),
          userId: dotGet(resume, "userId"),
        };
      },
    },

    watch: {
      resume(val) {
        if (!val) {
          this.turnCameraOn();
        }
      },
    },

    methods: {
      ...mapActions({
        fetchResume: "resume/fetchResumeByUid",
        fetchResumeData: "resume/fetchResume",
        fetchIsParticipant: "events/fetchEventParticipantHasReservation",
        fetchEventParticipants: "events/fetchEventParticipants",
        logEventEntry: "events/logEventEntry",
        fetchEventEntryList: "events/fetchEventEntryList",
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
            this.camera = "auto";
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

      async doOnDecode(content) {
        let uid = null;
        try {
          const { resume_uid: userUid } = JSON.parse(content);
          uid = userUid;
        } catch {
          throw new Error("Could not parse QR Code data");
        }

        this.turnCameraOff();

        const { userId, id: resumeId } = await this.fetchResume({ uid });

        if (!userId) {
          throw new Error("Unknown user");
        }

        const { selectedEvent, eventKey: rawEventKey } = this;
        const eventKey = {
          ...rawEventKey,
          userId,
        };

        const [
          resume,
          eventParticipants,
          hasReservation,
          reservationData,
        ] = await Promise.all([
          await this.fetchResumeData({ resumeId }),
          await this.fetchEventParticipants(eventKey),
          await this.fetchIsParticipant(eventKey),
          await this.fetchEventEntryList(eventKey),
        ]);

        const capacity = getParticipantCapacityFor(selectedEvent.type);

        Object.assign(
          resume,
          {
            hasReservation,
            eventSlots: {
              total: capacity,
              free: Math.max(
                0,
                capacity - eventParticipants.event,
              ),
              filled: eventParticipants.event,
            },
            logEntries: reservationData,
            alreadyEntered: reservationData.includes(Number(userId)),
          },
        );

        this.$set(this, "resume", resume);
      },

      async onDecode(contents) {
        this.message = "Loading info...";

        try {
          await this.doOnDecode(contents);
        } catch (e) {
          if ("string" === typeof e) {
            this.errorMessage = e;
          } else {
            this.errorMessage = e.message;
          }

          await sleep(3000);

          this.errorMessage = "";
          this.turnCameraOn();
        }

        this.message = "";
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

            if (!this.noFrontCamera) {
              this.camera = "front";
              return;
            }
          }

          if (triedFrontCamera && cameraMissingError) {
            this.noFrontCamera = true;

            if (!this.noRearCamera) {
              this.camera = "rear";
              return;
            }
          }

          if (this.noFrontCamera && this.noRearCamera && "auto" !== this.camera) {
            this.camera = "auto";
            return;
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

      async approveEntry() {
        const { eventKey } = this;

        this.resumeLoading = true;

        const { error, reason, errorData } = await this.logEventEntry(eventKey);

        this.resumeLoading = false;

        if (error) {
          const err =
            reason ||
            (
              errorData
                ? errorData.join("\n")
                : "Something went wrong"
            )
          ;

          return alert(err);
        }

        this.resume = null;
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
