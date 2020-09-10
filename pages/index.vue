<template>
  <div :class="$style.pageContainer" class="page-container">
    <v-row :class="$style.heroContainer">
      <v-col cols="12">
        <v-row>
          <v-col :class="$style.heroMainContainer" cols="12">
            <h3 :class="$style.heroDate">
              <translated-text trans-key="index.hero.date" />
            </h3>
            <h1 :class="$style.heroTitle">
              <translated-text trans-key="index.hero.title" />
              <br>
              <client-only>
                <vue-typer
                  :class="$style.typing"
                  :erase-delay="100"
                  :pre-erase-delay="3000"
                  :shuffle="true"
                  :text="titleTexts"
                  caret-animation="smooth"
                  erase-style="backspace"
                  initial-action="erasing"
                />
                <span slot="placeholder" :class="$style.typing">{{ titleTexts[0] }}</span>
              </client-only>
            </h1>
            <div :class="$style.heroButtonContainer">
              <v-btn
                :class="$style.heroButton"
                :href="getSetting('Join Now URL', '#')"
                color="primary"
                large
                rel="noopener noreferrer"
                target="_blank"
              >
                <translated-text trans-key="button.joinNow" />
              </v-btn>
            </div>
          </v-col>

          <v-col :class="$style.heroExplanationContainer" cols="12" md="5" offset-md="6">
            <h1 :class="$style.heroExplanationTitle">
              <translated-text trans-key="index.hero.explanation.title" />
            </h1>
            <div :class="$style.heroExplanationText">
              <translated-text trans-key="index.hero.explanation.text" />
            </div>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-row :class="$style.joinContainer">
      <v-col cols="12">
        <v-row :class="$style.joinCardsContainer">
          <v-col cols="12">
            <h1 :class="$style.joinHeader">
              <translated-text trans-key="index.join.header" />
            </h1>
          </v-col>

          <v-col :class="$style.joinCard" cols="12" md="3">
            <v-img
              :src="require('@/assets/images/participate-illustration-1.svg?inline')"
              aspect-ratio="1.12"
              contain
            />
            <h3>
              <translated-text trans-key="index.join.networking.header" />
            </h3>
            <p>
              <translated-text trans-key="index.join.networking.text" />
            </p>
          </v-col>

          <v-col :class="$style.joinCard" cols="12" md="3">
            <v-img
              :src="require('@/assets/images/participate-illustration-2.svg?inline')"
              aspect-ratio="1.12"
              contain
            />
            <h3>
              <translated-text trans-key="index.join.content.header" />
            </h3>
            <p>
              <translated-text trans-key="index.join.content.text" />
            </p>
          </v-col>

          <v-col :class="$style.joinCard" cols="12" md="3">
            <v-img
              :src="require('@/assets/images/participate-illustration-3.svg?inline')"
              aspect-ratio="1.12"
              contain
            />
            <h3>
              <translated-text trans-key="index.join.themes.header" />
            </h3>
            <p>
              <translated-text trans-key="index.join.themes.text" />
            </p>
          </v-col>
        </v-row>

        <v-row :class="$style.signupContainer">
          <v-col :class="$style.signupContentContainer" class="text-center text-md-left" cols="12" md="4">
            <h1>
              <translated-text trans-key="index.join.joinNow.header" />
            </h1>
            <p>
              <translated-text trans-key="index.join.joinNow.text" />
            </p>
            <div :class="$style.socialIconContainer">
              <v-btn
                v-for="icon in joinSocialImages"
                :key="icon.src"

                :class="$style.socialIcon"

                :href="icon.href"
                icon
                rel="noopener noreferrer"
                target="_blank"
              >
                <v-img
                  :alt="icon.name"
                  :src="icon.src"

                  aspect-ratio="1.4"
                  contain
                />
              </v-btn>
            </div>
          </v-col>

          <v-col class="text-center text-md-left" cols="12" md="6" offset-md="2">
            <v-row :class="$style.signupBullet">
              <v-col cols="4" md="2" offset="4" offset-md="0">
                <v-img
                  :src="require('@/assets/images/icons/prijavi-se-icon-1.svg?inline')"
                  aspect-ratio="1"
                  contain
                />
              </v-col>
              <v-col cols="12" md="8">
                <h5>
                  <translated-text trans-key="index.join.cv.header" />
                </h5>
                <p>
                  <translated-text trans-key="index.join.cv.text" />
                </p>
              </v-col>
            </v-row>

            <v-row :class="$style.signupBullet">
              <v-col cols="4" md="2" offset="4" offset-md="0">
                <v-img
                  :src="require('@/assets/images/icons/prijavi-se-icon-2.svg?inline')"
                  aspect-ratio="1"
                  contain
                />
              </v-col>
              <v-col cols="12" md="8">
                <h5>
                  <translated-text trans-key="index.join.qrCode.header" />
                </h5>
                <p>
                  <translated-text trans-key="index.join.qrCode.text" />
                </p>
              </v-col>
            </v-row>

            <v-row :class="$style.signupBullet">
              <v-col cols="4" md="2" offset="4" offset-md="0">
                <v-img
                  :src="require('@/assets/images/icons/prijavi-se-icon-3.svg?inline')"
                  aspect-ratio="1"
                  contain
                />
              </v-col>
              <v-col cols="12" md="8">
                <h5>
                  <translated-text trans-key="index.join.visibility.header" />
                </h5>
                <p>
                  <translated-text trans-key="index.join.visibility.text" />
                </p>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-row :class="$style.newsContainer">
      <v-col cols="12">
        <v-row>
          <v-col cols="12">
            <h1 :class="$style.newsHeader">
              <translated-text trans-key="index.news.header" />
            </h1>
          </v-col>
        </v-row>

        <v-row>
          <v-col
            v-for="newsItem in news"
            :key="newsItem.id"
            cols="12"
            md="4"
          >
            <app-news-card
              :class="$style.newsItem"
              :news-item="newsItem"
            />
          </v-col>
        </v-row>

        <v-row :class="$style.newsLearnMoreContainer">
          <v-col cols="12">
            <v-btn
              :class="$style.rightButton"
              :to="{ name: 'PageBlogHome' }"
              outlined
              x-large
            >
              <translated-text trans-key="index.news.learnMore" />
              <v-icon :class="$style.rightIcon">
                mdi-chevron-right
              </v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-row :class="$style.participantsContainer">
      <v-col cols="12">
        <v-row>
          <v-col cols="12">
            <h1 :class="$style.participantsHeader">
              <translated-text trans-key="index.participants.header" />
            </h1>
            <p :class="$style.participantsDescription">
              <translated-text trans-key="index.participants.text" />
            </p>
          </v-col>
        </v-row>

        <v-row>
          <v-col
            v-for="participant in participants"
            :key="participant.id"
            :class="$style.participantCol"
            cols="6"
          >
            <div :class="$style.participantContainer">
              <v-img
                :alt="participant.description"
                :lazy-src="participant.images && participant.images.small.url"
                :src="participant.image"
                :srcset="participant.images && getSrcSet(participant.images)"
                aspect-ratio="1.875"
                contain
              />
            </div>
          </v-col>
        </v-row>

        <!--<v-row>
          <v-col cols="12">
            <h1 :class="$style.participantsHeader">
              <translated-text trans-key="index.participants.projectFriends.header" />
            </h1>
            <p :class="$style.participantsDescription">
              <translated-text trans-key="index.participants.projectFriends.text" />
            </p>
          </v-col>
        </v-row>

        <v-row>
          <v-col
            v-for="friend in projectFriends"
            :key="friend.id"
            :class="$style.participantCol"
            cols="6"
          >
            <div :class="$style.participantContainer">
              <v-img
                :alt="friend.description"
                :src="friend.image"
                aspect-ratio="1.875"
                contain
              />
            </div>
          </v-col>
        </v-row>-->
      </v-col>
    </v-row>
  </div>
</template>

<script>
  import {
    mapActions,
    mapGetters,
  } from "vuex";
  import AppNewsCard from "~/components/news/NewsCard";
  import TranslatedText from "~/components/TranslatedText";
  import {
    ensureArray,
    limitLength,
  } from "~/helpers/data";
  import {
    getSrcSet,
  } from "~/helpers/image";
  import NotFoundImg from "~/assets/images/404.svg?inline";

  const storeActions = {
    fetchNews: "news/fetchNews",
    fetchParticipants: "companies/fetchParticipants",
    fetchProjectFriends: "companies/fetchProjectFriends",
  };

  export default {
    name: "Index",

    components: {
      TranslatedText,
      AppNewsCard,
    },

    async asyncData({ store }) {
      const ensureHasImage =
        (participants) =>
          participants
            .map((participant) => {
              if (!participant.image) {
                participant.image = NotFoundImg;
              }

              return participant;
            })
      ;

      const [
        news,
        projectFriends,
        participants,
      ] = await Promise.all([
        store.dispatch(storeActions.fetchNews).then(ensureArray).then(limitLength(3)),
        store.dispatch(storeActions.fetchProjectFriends).then(ensureArray),
        store.dispatch(storeActions.fetchParticipants).then(ensureArray).then(ensureHasImage),
      ]);

      return {
        news,
        projectFriends,
        participants,
      };
    },

    computed: {
      ...mapGetters({
        getSetting: "settings/getSetting",
      }),

      titleTexts() {
        return [
          "talk",
          "workshop",
          "panel",
          "party",
          "hot talk",
          "Meetup",
          "networking",
        ].sort(() => Math.random() - 0.5);
      },

      joinSocialImages() {
        return [
          {
            name: "Instagram",
            href: this.getSetting("Instagram URL"),
            src: require("@/assets/images/icons/ig.svg?inline"),
          },
          {
            name: "Facebook",
            href: this.getSetting("Facebook URL"),
            src: require("@/assets/images/icons/fb.svg?inline"),
          },
          {
            name: "YouTube",
            href: this.getSetting("Youtube URL"),
            src: require("@/assets/images/icons/yt.svg?inline"),
          },
        ];
      },
    },

    methods: {
      ...mapActions(storeActions),

      getSrcSet,
    },
  };
</script>

<style lang="scss" module>
  @import "../assets/styles/include/all";

  .pageContainer {

    & > :global(.row) > :global(.col.col-12) {
      max-width: $content-max-width;
      margin: 0 auto;
      padding: 0 2em;

      @include media(sm) {
        max-width: 91.5%;
      }
    }

    .heroContainer {
      $min-height: 1565px;

      min-height: $min-height;
      margin-bottom: 3em;
      background-color: $fer-dark-blue;
      background-image: url("../assets/images/index-bg.svg?inline");
      background-repeat: no-repeat;
      background-position: center #{-$nav-height};
      background-size: #{$page-max-width} #{$min-height};

      @include media(md) {
        $min-height: 1565px;

        min-height: $min-height;
        background-image: url("../assets/images/index-bg-mobile.svg?inline");
        background-size: #{map-get($breakpoints, md) * .9} #{$min-height};
      }

      .heroMainContainer {
        position: relative;

        .heroDate {
          font-size: 162.5%;
          font-weight: bold;
          margin-top: 1.5em;
          color: $fer-yellow;

          @include media(md) {
            font-size: 100%;
          }
        }

        .heroTitle {
          font-size: 406.25%;
          font-weight: 800;
          height: 4.5em;
          color: $fer-white;

          @include media(md) {
            font-size: 225%;
            height: 3.5em;
          }

          .typing {
            cursor: text;
            user-select: initial;
            color: $fer-yellow;

            :global(.custom.caret) {
              display: none;
            }

            :global(.custom.char.typed) {
              color: inherit;
            }
          }
        }

        .heroButtonContainer {
          margin-top: 4em;

          .heroButton {
            color: $fer-black;
          }
        }
      }

      .heroExplanationContainer {
        margin-top: 42em;

        @include media(md) {
          margin-top: 62em;
        }

        .heroExplanationTitle {
          font-size: 250%;
          font-weight: bold;
          color: $fer-yellow;

          @include media(md) {
            font-size: 162.5%;
          }
        }

        .heroExplanationText {
          font-size: 112.5%;
          color: $fer-white;

          @include media(md) {
            font-size: 100%;
          }
        }
      }
    }

    .joinContainer {
      margin-bottom: 3em;

      .joinHeader {
        font-size: 250%;
        font-weight: bold;
        text-align: center;
        color: $fer-dark-blue;
      }

      .joinCardsContainer {
        display: flex;
        justify-content: space-between;
      }

      .joinCard {
        text-align: center;

        > h3 {
          font-size: 125%;
          color: $fer-dark-blue;
          padding-bottom: 4px;
        }

        > p {
          font-size: 100%;
          margin: 0 auto;
        }

        @include media(md) {

          > h3 {
            font-size: 112.5%;
          }

          > p {
            max-width: 75%;
          }

        }
      }
    }

    .signupContainer {
      margin-top: 3em;
      margin-bottom: 3em;
      padding: 2em;
      background-color: darken(grayscale($fer-gray), 2%);

      .signupContentContainer {
        display: flex;
        flex-direction: column;

        h1 {
          font-size: 250%;
          color: $fer-dark-blue;
        }

        p {
          font-size: 125%;
        }

        .socialIconContainer {
          margin-top: auto;
          margin-bottom: 2em;

          .socialIcon {
            margin-right: 1em;
            color: #ffffff;
            background-color: transparent;
            transition-property: opacity;
            transition-duration: 250ms;
            transition-timing-function: $transition-timing-function;

            &:last-child {
              margin-right: 0;
            }

            &:hover {
              opacity: .7;
            }

            &:active {
              opacity: 1;
            }
          }

          @include media(md) {
            margin-top: 2em;

            > * {
              margin-right: 2.5em;
            }
          }
        }
      }

      .signupBullet {
        margin-bottom: 2em;

        &:last-child {
          margin-bottom: 0;
        }

        h5 {
          font-size: 125%;
          color: $fer-dark-blue;
        }

        @include media(md) {

          :global(.v-image) {
            max-width: 90px;
            margin: 0 auto;
          }

        }
      }
    }

    .newsContainer {
      margin-bottom: 3em;
      padding-bottom: 3em;
      background-color: $fer-dark-blue;

      .newsHeader {
        font-size: 250%;
        margin-top: 3rem;
        margin-bottom: 1rem;
        text-align: center;
        color: $fer-yellow;
      }

      .newsItem {
        max-width: 95%;
        height: 100%;
        margin: 0 auto;
      }

      .newsLearnMoreContainer {
        text-align: center;

        .rightButton {
          transition-timing-function: $transition-bounce-function;
          transition-duration: 300ms;
          transition-property: color;
          color: $fer-yellow;

          .rightIcon {
            font-size: 200%;
            position: relative;
            top: -1px;
            margin-right: -.2em;
            transition-timing-function: $transition-bounce-function;
            transition-duration: 300ms;
            transition-property: transform;
          }

          &:hover {
            color: fer-hover($fer-yellow);

            .rightIcon {
              transform: translateX(.3em);
            }
          }

          &:active {
            color: fer-active($fer-yellow);
          }
        }
      }
    }

    .participantsContainer {
      margin-bottom: 3em;

      .participantsHeader {
        font-size: 250%;
        margin-top: 1em;
        margin-bottom: .4em;
        text-align: center;
        color: $fer-dark-blue;

        @include media(sm) {
          font-size: 162.5%;
        }
      }

      .participantsDescription {
        font-size: 125%;
        text-align: center;

        @include media(sm) {
          font-size: 100%;
        }
      }

      .participantCol {
        $cols: 5;

        @include media-up(sm) {
          flex: 0 0 #{100% / $cols};
          max-width: #{100% / $cols};
        }

        @include media(sm) {
          padding: 0;
        }
      }

      .participantContainer {
        padding: .5em;
        cursor: pointer;
        border: 1px dashed rgba(0, 0, 0, .3);

        @include media(sm) {
          margin: .5em;
        }
      }
    }
  }
</style>
