<template>
  <app-max-width-container :class="$style.container">
    <v-row>
      <v-col cols="12" md="6">
        <h2>
          <nuxt-link :class="$style.back" :to="{ name: 'PageSudionici' }">
            <v-icon>mdi-chevron-left</v-icon>
            Svi sudionici
          </nuxt-link>
        </h2>
      </v-col>

      <v-col class="d-flex flex-column" cols="12" md="6">
        <div
          :class="{
            'ml-md-2': !isPanel,
            'ml-md-n1': isPanel,
            'mb-md-n12': isPanel,
          }"
        >
          <h1
            v-if="!isPanel"
            :class="$style.company"
            v-text="eventObj.company.name"
          />
          <h3
            :class="$style.type"
            v-text="eventObj.type"
          />
        </div>
        <h4 :class="$style.info">
          <v-img
            :alt="capitalize(eventObj.type)"
            :class="$style.icon"
            :src="icons[eventObj.type]"
            :title="capitalize(eventObj.type)"
            aspect-ratio="1"
            class="mr-2"
            contain
          />
          <span :class="$style.infoText" :title="eventDate">
            {{ eventDay }} | {{ eventTime }} | {{ eventObj.location || "TBA" }}
          </span>
        </h4>
      </v-col>
    </v-row>

    <v-row class="mt-n4">
      <v-col
        class="my-4 my-md-0"
        cols="10"
        md="6"
        offset="1"
        offset-md="0"
        order="2"
        order-md="1"
      >
        <v-img
          v-if="!isPanel"

          :lazy-src="eventObj.company.thumbnail"
          :src="eventObj.company.image"
          aspect-ratio="1.78"
          contain
        />

        <v-carousel
          v-else

          :show-arrows="false"
          continuous
          cycle
          height="auto"
          hide-delimiters
          interval="3000"
          touchless
        >
          <v-carousel-item
            v-for="image in companyImageList"
            :key="image.src"
          >
            <v-img
              v-bind="image"
              aspect-ratio="1.78"
              class="mx-6"
              contain
            />
          </v-carousel-item>
        </v-carousel>
      </v-col>

      <v-col
        cols="12"
        md="6"
        order="1"
        order-md="2"
      >
        <v-row>
          <v-col cols="12">
            <h1
              :class="$style.title"
              v-text="eventObj.title || eventObj.name"
            />
            <v-row v-if="isPanel" class="mb-6">
              <v-col class="pb-0" cols="12">
                <h3 class="secondary--text text-uppercase">
                  <translated-text trans-key="participants.event.otherParticipants" />
                </h3>
              </v-col>
              <v-col class="pt-0" cols="12">
                <v-chip
                  v-for="{ info: company } in eventObj.companies"
                  :key="company.id"
                  :to="{ name: 'PageSudioniciCompanyInfo', params: { id: company.id } }"
                  class="mr-6"
                  label
                  large
                  outlined
                  pill
                >
                  <v-avatar class="ml-1" left tile>
                    <v-img
                      :lazy-src="company.thumbnail"
                      :src="company.thumbnail"
                      aspect-ratio="1"
                      contain
                    />
                  </v-avatar>
                  {{ company.name }}
                </v-chip>
              </v-col>
            </v-row>
            <p
              :class="$style.breakSpaces"
              v-text="eventObj.description"
            />
          </v-col>

          <v-col
            v-if="eventObj.presenterBio"
            :class="$style.presenterBio"
            cols="12"
          >
            <h2 :class="$style.about">
              <translated-text trans-key="participants.event.aboutPresenter" />
            </h2>

            <div>
              <v-avatar
                v-if="eventObj.presenterPhoto"
                :class="$style.presenterAvatar"
                color="secondary"
                left
                size="100"
              >
                <v-img
                  :lazy-src="dotGet(eventObj, 'presenterPhoto.small.url')"
                  :src="dotGet(eventObj, 'presenterPhoto.small.url')"
                  alt="Presenter photo"
                />
              </v-avatar>
              {{ eventObj.presenterBio }}
            </div>
          </v-col>

          <v-col
            v-if="eventObj.leaderBiography"
            cols="12"
          >
            <h2 :class="$style.about">
              <translated-text trans-key="participants.event.aboutWorkshopLeader" />
            </h2>

            <p
              :class="$style.breakSpaces"
              v-text="eventObj.leaderBiography"
            />
          </v-col>

          <v-col
            v-if="eventObj.studentRequirements"
            cols="12"
          >
            <h2 :class="$style.about">
              <translated-text trans-key="participants.event.studentRequirements" />
            </h2>

            <p
              :class="$style.breakSpaces"
              v-text="eventObj.studentRequirements"
            />
          </v-col>

          <v-col v-if="isPanel" cols="12">
            <h2 :class="$style.about">
              <translated-text trans-key="participants.event.aboutPanelists" />
            </h2>

            <v-row
              v-for="{ info: company, aboutPanelist } in eventObj.companies"
              :key="company.id"
            >
              <v-col cols="12">
                <v-row>
                  <v-col
                    class="d-flex align-center"
                    cols="6"
                    md="3"
                    offset="3"
                    offset-md="0"
                    offset-sm="4"
                    sm="4"
                  >
                    <v-card
                      flat
                    >
                      <v-img
                        :lazy-src="company.thumbnail"
                        :src="getSrcWithWidth(company.images, 300)"
                        contain
                        width="100%"
                      />

                      <v-card-subtitle
                        class="text-center pt-1"
                        v-text="company.name"
                      />
                    </v-card>
                  </v-col>

                  <v-col
                    class="d-flex align-center justify-center justify-md-start"

                    cols="12"
                    md="9"
                  >
                    <div class="text-center text-md-left" v-text="aboutPanelist" />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-row v-if="!isPanel">
      <v-col cols="12" md="6" offset-md="6">
        <h2 :class="$style.about">
          <translated-text trans-key="participants.event.aboutCompany" />
        </h2>
        <p
          :class="$style.breakSpaces"
          v-text="eventObj.company.description"
        />
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<router>
name: PageSudioniciInfo
</router>

<script>
  import {
    mapGetters,
  } from "vuex";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";
  import TranslatedText from "~/components/TranslatedText";
  import {
    dotGet,
  } from "~/helpers/data";
  import {
    generateMetadata,
  } from "~/helpers/head";
  import {
    getSrcWithWidth,
  } from "~/helpers/image";
  import {
    capitalize,
  } from "~/helpers/string";

  export default {
    name: "PageSudioniciInfo",

    components: {
      TranslatedText,
      AppMaxWidthContainer,
    },

    computed: {
      ...mapGetters({
        rawEvent: "companies/getEvent",
      }),

      isPanel() {
        return "panel" === this.eventObj.type;
      },

      eventObj() {
        const { occuresAt, ...event } = this.rawEvent;

        return {
          ...event,
          date: new Date(occuresAt),
          type: this.$route.params.type,
        };
      },

      eventDay() {
        return this.weekday(this.eventObj.date);
      },

      eventTime() {
        return this.time(this.eventObj.date);
      },

      eventDate() {
        const { date: eventDate, location: eventLocation } = this.eventObj;

        const date = new Date(eventDate).toLocaleString("hr-HR");
        const location = eventLocation || "TBA";

        return `${ date } @ ${ location }`;
      },

      icons() {
        return {
          talk: require("@/assets/images/icons/talk.png"),
          workshop: require("@/assets/images/icons/workshop.png"),
          panel: require("@/assets/images/icons/panel.png"),
        };
      },

      companyImageList() {
        const { companies = [] } = this.eventObj;

        return companies.map(({ info: company }) => ({
          src: dotGet(company, "images.large.url"),
          "lazy-src": dotGet(company, "images.small.url"),
        }));
      },
    },

    methods: {
      dotGet,
      getSrcWithWidth,
      capitalize,

      weekday(date) {
        const days = [
          "nedjelja",
          "ponedjeljak",
          "utorak",
          "srijeda",
          "četvrtak",
          "petak",
          "subota",
        ];
        const dateObj = new Date(date);

        return days[dateObj.getDay()];
      },

      time(date) {
        const dateObj = new Date(date);
        const zeroPad = (n) => String(n).padStart(2, "0");
        return `${ zeroPad(dateObj.getHours()) }:${ zeroPad(dateObj.getMinutes()) }`;
      },
    },

    validate({ store, params }) {
      return store.dispatch("companies/fetchEvent", { id: params.id, type: params.type });
    },

    head() {
      if (!this.$route) {
        return {};
      }

      const { title: eventTitle, name, company } = this.eventObj;
      const { type } = this.$route.params;

      const capitalize = (str) => str.slice(0, 1).toUpperCase() + str.slice(1);

      const n = eventTitle || name;
      const title = `${ n } | ${ capitalize(type) } by ${ company.name }`;

      return {
        title,
        meta: [
          ...generateMetadata({
            title,
          }),
        ],
      };
    },
  };
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  .container {
    margin-top: 3em;

    .breakSpaces {
      white-space: break-spaces;
    }

    .back {
      font-size: 1rem;
      font-weight: bold;
      text-decoration: none;
      color: $fer-dark-blue;

      :global(.v-icon) {
        color: inherit;
      }
    }

    .company {
      font-size: 250%;
      font-weight: 800;
      color: $fer-dark-blue;
    }

    .type {
      font-size: 100%;
      font-weight: bold;
      margin-top: .8em;
      margin-left: .5em;
      text-transform: uppercase;
      color: $fer-dark-blue;

      @include media(md) {
        margin-top: .2em;
        margin-left: .25em;
      }
    }

    .info {
      font-size: 1rem;
      font-weight: normal;
      margin-top: 4em;
      color: $fer-black;

      @include media(md) {
        margin-top: .8em;
      }

      .icon {
        top: .2em;
        display: inline-block;
        width: 1.2em;
        height: 1.2em;
      }

      .infoText {
        opacity: .7;
      }
    }

    .title {
      font-size: 187.5%;
      font-weight: bold;
      margin-bottom: .35em;
      color: $fer-dark-blue;

      @include media(md) {
        font-size: 137.5%;
      }
    }

    .about {
      font-size: 100%;
      font-weight: bold;
      margin-bottom: .5em;
      text-transform: uppercase;
      color: $fer-dark-blue;
    }

    .presenterBio {

      .presenterAvatar {
        float: left;
        margin-right: 2em;
        clip-path: circle();
        shape-outside: circle();
      }
    }
  }
</style>
