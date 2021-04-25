<template>
  <div
    :class="{
      [$style.container]: true,
      'd-none': !showConsent
    }"
  >
    <div
      :class="$style.body"
    >
      <v-img
        :class="$style.image"
        :src="require('@/assets/images/icons/footer/icon-cookie.png')"
        aspect-ratio="1"
        contain
      />

      <div
        :class="$style.text"
      >
        <translated-text
          trans-key="cookieConsent.text"
        />
        <a
          :class="$style.moreInfo"
          href="#"
          @click.stop="dialog = true"
        >
          <translated-text
            trans-key="cookieConsent.moreInfo.link"
          />
        </a>
      </div>

      <v-btn
        :class="$style.acceptButton"
        color="primary"
        depressed
        tile
        @click="acceptConsent"
      >
        <translated-text
          trans-key="button.accept"
        />
      </v-btn>

      <v-btn
        :class="$style.closeButton"
        color="secondary"
        icon
        @click="denyConsent"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>

    <v-dialog
      v-model="dialog"
      :class="$style.noticeDialog"
      max-width="700"
    >
      <v-card>
        <v-card-title class="headline" :class="$style.headline">
          Pravila o kolačićima za Job Fair Meetup
        </v-card-title>

        <v-card-text>
          <p>
            Ovo su pravila o kolačićima za Job Fair Meetup, kojima se može pristupiti s adrese <a href="https://jobfairmeetup.fer.unizg.hr/">https://jobfairmeetup.fer.unizg.hr/</a>
          </p>

          <div>
            <p>
              <b>Što su kolačići?</b>
            </p>

            <p>
              Kao što je uobičajena praksa kod gotovo svih profesionalnih stranica, ova internetska stranica koristi kolačiće, odnosno malene datoteke koje se preuzimaju na vaše računalo, radi poboljšanja vašeg
              iskustva. Ova stranica opisuje koje podatke prikupljaju, kako ih koristimo i zašto ponekad moramo pohraniti ove kolačiće. Također ćemo podijeliti kako možete spriječiti pohranu ovih kolačića, no to
              može smanjiti ili onemogućiti određene elemente ili funkcionalnosti stranice. Za općenitije informacije o kolačićima pročitajte ovaj članak.
            </p>
          </div>

          <div>
            <p>
              <b>Kako koristimo kolačiće?</b>
            </p>

            <p>
              Kolačiće koristimo iz raznih razloga opisanih u nastavku. Nažalost, u većini slučajeva ne postoje standardne opcije za onemogućavanje kolačića bez potpunog onemogućavanja funkcionalnosti i značajki
              koje
              dodaju na ovu stranicu. Preporučuje se da ostavite sve kolačiće ako niste sigurni trebate li ih ili ne u slučaju da se koriste za pružanje neke od usluga koju koristite na našoj stranici.
            </p>
          </div>

          <div>
            <p>
              <b>Onemogućavanje kolačića</b>
            </p>

            <p>
              Postavljanje kolačića možete spriječiti podešavanjem postavki na vašem pregledniku (kako to učiniti potražite na službenim stranicama vašeg preglednika). Imajte na umu da će onemogućavanje kolačića
              utjecati na funkcionalnost ove i mnogih drugih internetskih stranica koje posjećujete. Onemogućavanje kolačića obično će rezultirati i onemogućavanjem određenih funkcionalnosti i značajki ove
              internetske stranice. Stoga se preporučuje da omogućite kolačiće.
            </p>
          </div>

          <div>
            <p>
              <b>Kolačiće koje koristimo</b>
            </p>

            <ul>
              <li>
                Kolačići povezani s računom
                <br>
                Ako napravite račun kod nas, mi ćemo koristiti kolačiće za upravljanje postupkom registracije i opću administraciju. Ti se kolačići obično brišu kada se odjavite, no u nekim slučajevima mogu
                ostati i nakon toga da bi zapamtili postavke vaše web lokacije kada ste odjavljeni.
              </li>

              <li>
                Kolačići povezani s prijavom
                <br>
                Kolačiće koristimo kada ste prijavljeni kako bismo se mogli sjetiti ovih podataka. To sprječava da se morate prijaviti svaki put kad posjetite našu stranicu. Ti se kolačići obično uklanjaju ili brišu
                kada se odjavite kako biste osigurali da možete pristupiti ograničenim značajkama i područjima naše stranice samo kada ste prijavljeni.
              </li>

              <li>
                Kolačići povezani s obrascima
                <br>
                Kada podatke šaljete putem obrasca poput onih koji se nalaze na stranicama studentskog poratala, kolačići mogu biti postavljeni tako da pamte vaše korisničke podatke za buduću korespondenciju.
              </li>

              <li>
                Kolačići za preferencije
                <br>
                Kako bismo vam pružili sjajno iskustvo na našoj stranici, pružamo funkcionalnost za podešavanje vaših postavki načina rada naše stranice kada je koristite. Da bismo zapamtili vaše postavke, moramo
                postaviti kolačiće tako da se ti podaci mogu pozivati kad god komunicirate sa stranicom na koju vaše postavke utječu.
              </li>
            </ul>

            <p />
          </div>

          <div>
            <p>
              <b>Kolačići treće strane</b>
            </p>

            <p>
              U nekim posebnim slučajevima koristimo i kolačiće koje pružaju pouzdane treće strane. Sljedeći odjeljak detaljno opisuje koje kolačiće trećih strana možete naići na našoj stranici.
            </p>

            <ul>
              <li>
                Naša stranica koristi Google Analytics, jedno od najraširenijih i najpouzdanijih rješenja za analitiku na internetu, koji nam pomaže da shvatimo kako koristite našu stranicu i načine na koje možemo
                poboljšati vaše iskustvo. Ovi kolačići mogu pratiti stvari poput vremena koje provodite na našim stranicama kako bismo nastavili stvarati zanimljiv sadržaj.
                Za više informacija o kolačićima Google Analyticsa pogledajte njihovu službenu stranicu.
              </li>

              <li>
                Povremeno testiramo nove značajke i izvršavamo suptilne promjene u načinu isporuke funkcionalnosti naše stranice. Kada još uvijek testiramo nove značajke, ovi se kolačići mogu koristiti za
                osiguravanje dosljednog iskustva tijekom boravka na stranici, istovremeno osiguravajući da razumijemo koje optimizacije naši korisnici najviše cijene.
              </li>
            </ul>

            <p />
          </div>

          <div>
            <p>
              <b>Više informacija</b>
            </p>

            <p>
              Nadamo se da su vam ova pravila razjasnila zašto su kolačići bitni i kao što je već spomenuto, ako postoji nešto za što niste sigurni trebate li kolačiće ili ne, obično je sigurnije da kolačiće
              ostavite omogućenima u slučaju da su potrebni za interakciju s jednom od značajki koje koristite na našoj stranici.
            </p>
          </div>

          <div>
            <p>
              Međutim, ako i dalje tražite više informacija, možete nas kontaktirati putem naše e-adrese <a href="mailto:jobfair@fer.hr" target="_blank">jobfair@fer.hr</a>.
            </p>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            color="green darken-1"
            text
            @click="dialog = false"
          >
            <translated-text
              trans-key="actions.cancel"
            />
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import {
    mapActions,
    mapGetters,
  } from "vuex";
  import {
    onAnalyticsReady,
  } from "vue-analytics";
  import TranslatedText from "./TranslatedText";

  export default {
    name: "CookieConsent",

    components: {
      TranslatedText,
    },

    data: () => ({
      dialog: false,
    }),

    computed: {
      ...mapGetters("cookieConsent", [
        "showConsent",
        "hasConsent",
      ]),
    },

    mounted() {
      onAnalyticsReady().then(() => {
        this.$store.dispatch("cookieConsent/fetchConsent");
      });
    },

    methods: {
      ...mapActions("cookieConsent", [
        "acceptConsent",
        "denyConsent",
      ]),

      async consent(state) {
        switch (state) {
          case "accept":
            await this.acceptConsent();
            break;
          case "deny":
            await this.denyConsent();
            break;
        }
      },
    },
  };
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  $breakpoint: sm;

  :global(.v-application) {

    .headline {
      font-family: $font-stack !important;
    }
  }

  .container {
    position: fixed;
    z-index: 99;
    right: 0;
    bottom: 1.5em;
    left: 0;
    max-width: $cookie-consent-max-width;
    margin: 0 auto;
    transition-timing-function: $transition-timing-function;
    transition-duration: .3s;
    transition-property: bottom, max-width;
    will-change: bottom, max-width;

    @include media($breakpoint) {
      bottom: 0;
      max-width: 100%;
    }

    .body {
      $gap: 14px;

      display: grid;
      align-items: center;
      justify-content: space-evenly;
      padding: $gap;
      background-color: transparentize($fer-white, .1);
      grid-template-columns: 40px auto auto auto;
      grid-template-rows: auto;
      grid-gap: $gap;
      grid-template-areas: "img text accept close";

      @include media($breakpoint) {
        grid-template-columns: auto;
        grid-template-areas:
          "text   close"
          "accept accept";
      }
    }

    .image {
      grid-area: img;

      @include media($breakpoint) {
        display: none !important;
      }
    }

    .text {
      font-size: 14px;
      display: inline-block;
      order: 1;
      color: $fer-black;
      grid-area: text;
    }

    .moreInfo {
      font-weight: 600;
      color: $fer-dark-blue;
    }

    .acceptButton {
      order: 2;
      color: $fer-black !important;
      grid-area: accept;

      @include media($breakpoint) {
        order: 4;
        width: 12em;
        margin-left: auto;
      }
    }

    .closeButton {
      display: block;
      order: 4;
      grid-area: close;

      @include media($breakpoint) {
        order: 2;
      }
    }
  }
</style>
