<template>
  <div :class="$style.pageContainer" class="page-container">
    <v-row :class="$style.heroContainer">
      <v-col cols="12">
        <v-row>
          <v-col :class="$style.heroMainContainer" cols="12">
            <h3 :class="$style.heroDate">
              19. - 23.10. | FER, Zagreb
            </h3>
            <h1 :class="$style.heroTitle">
              Ulovi karijeru
              <br>
              dolaskom na
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
                color="primary"
                href="https://jobfair.fer.unizg.hr"
                large
                rel="noopener noreferrer"
                target="_blank"
              >
                Prijavi se
              </v-btn>
            </div>
          </v-col>

          <v-col :class="$style.heroExplanationContainer" cols="12" md="5" offset-md="6">
            <h1 :class="$style.heroExplanationTitle">
              Što je Job Fair Meetup?
            </h1>
            <div :class="$style.heroExplanationText">
              Job Fair Meetup na jednom mjestu okuplja vrhunska tehnološka poduzeća i uspješne studente
              s ciljem upoznavanja i razmjene znanja. Sudjelovanjem na talkovima, radionicama i panel
              raspravama studenti se u opuštenoj atmosferi mogu upoznati s aktualnim tehnološkim temama,
              problemima i rješenjima te mogućnostima zapošljavanja.
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
              Sudjeluj i ti!
            </h1>
          </v-col>

          <v-col :class="$style.joinCard" cols="12" md="3">
            <v-img
              :src="require('@/assets/images/participate-illustration-1.svg?inline')"
              aspect-ratio="1.12"
              contain
            />
            <h3>Umrežavanje izvrsnih</h3>
            <p>
              Pronađi posao ili praksu razgovarajući sa zaposlenicima poduzeća u opuštenoj atmosferi
            </p>
          </v-col>

          <v-col :class="$style.joinCard" cols="12" md="3">
            <v-img
              :src="require('@/assets/images/participate-illustration-2.svg?inline')"
              aspect-ratio="1.12"
              contain
            />
            <h3>Raznovrstan sadržaj</h3>
            <p>
              Prijavi se na talk, radionicu i panel te usvoji korisna znanja o najnovijim tehnologijama
            </p>
          </v-col>

          <v-col :class="$style.joinCard" cols="12" md="3">
            <v-img
              :src="require('@/assets/images/participate-illustration-3.svg?inline')"
              aspect-ratio="1.12"
              contain
            />
            <h3>Tematska raznolikost</h3>
            <p>
              Otkrij što te čeka u raznim tehnološkim industrijama i usmjeri put svoje buduće karijere
            </p>
          </v-col>
        </v-row>

        <v-row :class="$style.signupContainer">
          <v-col :class="$style.signupContentContainer" class="text-center text-md-left" cols="12" md="4">
            <h1>Prijavi se</h1>
            <p>
              Prati nas na društvenim mrežama i među prvima saznaj kada krenu prijave za Job Fair Meetup!
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
                <h5>CV je ulaznica</h5>
                <p>Predaj svoj CV u bazu životopisa kojoj će imati pristup svi poslodavci</p>
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
                <h5>Dođi do svog QR koda</h5>
                <p>Za ispunjeni životopis u bazi dobivaš jedinstveni QR kod na svoju adresu e-pošte</p>
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
                <h5>Povećaj si vidljivost</h5>
                <p>Poduzeća mogu skenirati tvoj QR kod i tako brže pronaći tvoj CV u bazi životopisa</p>
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
              Novosti
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
              :news-item="newsItem"
              :class="$style.newsItem"
            />
          </v-col>
        </v-row>

        <v-row :class="$style.newsLearnMoreContainer">
          <v-col cols="12">
            <v-btn
              :class="$style.rightButton"
              :to="{ name: 'PageBlogHome' }"
              color="primary"
              outlined
              x-large
            >
              Saznaj više <i :class="$style.rightIcon">></i>
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
              Sudionici
            </h1>
            <p :class="$style.participantsDescription">
              Klikni na logotip poduzeća koje te zanima i saznaj kada se održava njihov <i>talk</i>, radionica ili panek rasprava!
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
                :src="participant.image"
                :lazy-src="participant.images.small.url"
                :srcset="getSrcSet(participant.images)"
                aspect-ratio="1.875"
                contain
              />
            </div>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <h1 :class="$style.participantsHeader">
              Prijatelji projekta
            </h1>
            <p :class="$style.participantsDescription">
              Istraži naše prijatelje klikom na njihov logotip!
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
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script>
  import {
    mapActions,
  } from "vuex";
  import AppNewsCard from "~/components/news/NewsCard";
  import {
    ensureArray,
    limitLength,
  } from "~/helpers/data";
  import {
    getSrcSet,
  } from "~/helpers/image";

  const storeActions = {
    fetchNews: "news/fetchNews",
    fetchParticipants: "companies/fetchParticipants",
    fetchProjectFriends: "companies/fetchProjectFriends",
  };

  export default {
    name: "Index",
    components: { AppNewsCard },
    async asyncData({ store }) {
      const [
        news,
        projectFriends,
        participants,
      ] = await Promise.all([
        store.dispatch(storeActions.fetchNews).then(ensureArray).then(limitLength(3)),
        store.dispatch(storeActions.fetchProjectFriends).then(ensureArray),
        store.dispatch(storeActions.fetchParticipants).then(ensureArray),
      ]);

      return {
        news,
        projectFriends,
        participants,
      };
    },

    computed: {
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
            href: "#",
            src: require("@/assets/images/icons/ig.svg?inline"),
          },
          {
            name: "Facebook",
            href: "#",
            src: require("@/assets/images/icons/fb.svg?inline"),
          },
          {
            name: "YouTube",
            href: "#",
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
      background-position: center -60px;
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

            &:last-child {
              margin-right: 0;
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

          .rightIcon {
            font-size: 200%;
            position: relative;
            bottom: .1em;
            margin-left: .4rem;
            padding-right: .4rem;
            transition-timing-function: cubic-bezier(.35, 1.55, .65, 1);
            transition-duration: 250ms;
            transition-property: padding-right, margin-left;
          }

          &:hover {

            .rightIcon {
              margin-left: .8rem;
              padding-right: 0;
            }
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
