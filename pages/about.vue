<template>
  <app-max-width-container :class="$style.container" class="mb-12">
    <v-row>
      <v-col cols="12">
        <h1 :class="$style.mainHeader">
          O meetupu
        </h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6" offset-md="3">
        <v-img
          :src="require('@/assets/images/meetup-illustration-1.svg?inline')"
          aspect-ratio="1"
          contain
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
      >
        <h2
          :class="$style.header"
        >
          Što je Job Fair Meetup?
        </h2>
        <p>
          Job Fair Meetup na jednom mjestu okuplja vrhunska tehnološka poduzeća i uspješne studente s ciljem međusobnog upoznavanja, umrežavanja, razmjene znanja i iskustava te stjecanja novih vještina. Sudjeluj u
          zabavnim sadržajima: talkovima, radionicama i panel raspravama te se u opuštenoj atmosferi upoznaj s aktualnim tehnološkim temama, problemima i rješenjima te mogućnostima zapošljavanja i razvojem karijere
          u Hrvatskoj. Fakultet elektrotehnike i računarstva s Klubom studenata elektrotehnike na tjedan dana postaje mjestom okupljanja Job Fair Meetupa koji otvara vrata mnogim prilikama, a otvoren je za sve
          posjetitelje.
        </p>
      </v-col>
    </v-row>

    <v-row
      :class="$style.locationContainer"
    >
      <v-col
        cols="12"
        md="10"
        offset-md="1"
      >
        <v-row>
          <v-col cols="12">
            <h2 :class="$style.header" class="text-center">
              Lokacija
            </h2>
            <h4 :class="$style.locationSubheader" class="text-center">
              Unska 3, 10 000 Zagreb
            </h4>
          </v-col>
        </v-row>

        <v-row>
          <v-col
            cols="8"
            md="6"
            offset="2"
            offset-md="0"
          >
            <v-img
              :src="require('@/assets/images/meet-icon-1-kset.svg?inline')"
              aspect-ratio="1"
              class="mx-12"
              contain
            />
            <p :class="$style.locationName" class="mt-6 text-center">
              KSET
            </p>
          </v-col>
          <v-col
            cols="8"
            md="6"
            offset="2"
            offset-md="0"
          >
            <v-img
              :src="require('@/assets/images/meet-icon-2-fer.svg?inline')"
              aspect-ratio="1"
              class="mx-12"
              contain
            />
            <p :class="$style.locationName" class="mt-6 text-center">
              FER
            </p>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
      >
        <h2
          :class="$style.header"
        >
          Što sve mogu posjetiti?
        </h2>
        <p
          class="mb-12"
        >
          Job Fair Meetup na jednom mjestu okuplja vrhunska tehnološka poduzeća i uspješne studente s ciljem međusobnog upoznavanja, umrežavanja, razmjene znanja i iskustava te stjecanja novih vještina. Sudjeluj u
          zabavnim sadržajima: talkovima, radionicama i panel raspravama te se u opuštenoj atmosferi upoznaj s aktualnim tehnološkim temama, problemima i rješenjima te mogućnostima zapošljavanja i razvojem karijere
          u Hrvatskoj. Fakultet elektrotehnike i računarstva s Klubom studenata elektrotehnike na tjedan dana postaje mjestom okupljanja Job Fair Meetupa koji otvara vrata mnogim prilikama, a otvoren je za sve
          posjetitelje.
        </p>
        <v-img
          :src="require('@/assets/images/meetup-illustration-2.svg?inline')"
          aspect-ratio="1.15"
          contain
        />
      </v-col>
    </v-row>

    <v-row
      class="mt-n4 mb-n8"
    >
      <v-col
        cols="12"
      >
        <v-divider
          :class="$style.spacer"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="10"
        offset-md="1"
      >
        <v-row>
          <v-col
            cols="12"
          >
            <v-img
              :src="require('@/assets/images/talks.svg?inline')"
              aspect-ratio="1"
              class="ml-md-n3 ml-md-0 ml-auto mb-n8 mb-md-0"
              contain
              width="100"
            />
            <h2
              :class="$style.header"
            >
              Talks
            </h2>
            <p>
              It’s time to Talk! Na Job Fair Meetupu imat ćeš priliku poslušati zanimljive talkove iz tri kategorije: Into My Day, Deep Dive i New Tech On The Block i saznati više o tebi zanimljivom poduzeću.
            </p>

            <h3
              :class="$style.subHeader"
              class="mt-11"
            >
              Into My Day
            </h3>
            <p>
              Kako uopće izgleda jedan radni dan stručnjaka iz industrije koja te zanima? Kako se snaći na novom radnom mjestu? Uz to se sigurno pitaš i kako balansirati rad u dinamičnom timu i privatni život uz sve
              hobije koje trenutno imaš? Saznaj odgovore iz prve ruke uhodanih zaposlenika koji su se pripremili s tobom podijeliti svoje tajne!
            </p>

            <h3
              :class="$style.subHeader"
              class="mt-8"
            >
              Deep Dive
            </h3>
            <p>
              Koristeći jedan primjer iz prakse, predstavnici poduzeća objasnit će kako razvijaju metodologije kojima rješavaju nove probleme te kako se prilagođavaju svakoj novonastaloj situaciji koja zahtjeva da
              se u potpunosti promijeni način razmišljanja i korištenja tehnologije. Ako želiš saznati njihove načine, na tebi je samo da im se pridružiš na njihovom talku!
            </p>

            <h3
              :class="$style.subHeader"
              class="mt-8"
            >
              New Tech on the Block
            </h3>
            <p>
              Zanima te koliko je zahtjevno osmisliti moderan i inovativan proizvod na konkuretnom tržištu? Kako poduzeća usprkos velikom riziku profitiraju i kontinuirano osiguravaju rast i razvoj svojeg poduzeća
              uz efikasne i produktivne ideje. Osvježite svoja razmišljanja uz poduzeća koja postavljanju nove tehnološke trendove današnjice.
            </p>
          </v-col>
        </v-row>

        <v-row>
          <v-col
            cols="12"
          >
            <v-img
              :src="require('@/assets/images/workshops.svg?inline')"
              aspect-ratio="1"
              class="ml-md-n ml-md-0 ml-auto mb-n8 mb-md-0"
              contain
              width="100"
            />
            <h2
              :class="$style.header"
            >
              Radionice
            </h2>
            <p>
              Prijavi se na radionicu i stekni vještine potrebne za upravljanje modernim tehnologijama. Predstavnici poduzeća imat će priliku predstaviti svoje područje rada na praktičan i zanimljivim način, a ti
              ćeš u interakciji s njima saznati više o tehnologijama u kojima su najbolji. Spoj zabave i učenja postoji, a sada znaš i gdje.
            </p>
          </v-col>
        </v-row>

        <v-row>
          <v-col
            cols="12"
          >
            <v-img
              :src="require('@/assets/images/panel.svg?inline')"
              aspect-ratio="1"
              class="ml-md-n ml-md-0 ml-auto mb-n8 mb-md-0"
              contain
              width="100"
            />
            <h2
              :class="$style.header"
            >
              Panel rasprave
            </h2>
            <p>
              Kakvo bi to okupljanje akademske i gospodarske zajednice bilo bez kvalitetne rasprave? Upravo zato na Job Fair Meetupu će se održati panel rasprave na kojima će se družiti stručnjaci, znanstvenici,
              predstavnici poduzeća i studenti koji će imati prilike raspravljati o tri aktualne teme.
            </p>
          </v-col>
        </v-row>

        <v-row>
          <v-col
            cols="12"
          >
            <v-img
              :src="require('@/assets/images/networking.svg?inline')"
              aspect-ratio="1"
              class="ml-md-n ml-md-0 ml-auto mb-n8 mb-md-0"
              contain
              width="100"
            />
            <h2
              :class="$style.header"
            >
              Networking
            </h2>
            <p>
              Proširi svoju mrežu poznanstva! U neformalnoj atmosferi upoznaj se s predstavnicima poduzeća koja su ti zanimljiva i saznaj kakve ti mogućnosti zapošljavanja pružaju. Ispitaj ih koje su im sve pozicije
              trenutno otvorene te kako se možeš i prijaviti. Podijeli s njima i svoj QR kod kako bi ostali u kontaktu i nakon ugodnog umrežavanja koje ti donosimo uz grickalice i osvježenje nakon svakog bloka
              predstavljanja poduzeća.
            </p>
          </v-col>
        </v-row>

        <v-row>
          <v-col
            cols="12"
          >
            <v-img
              :src="require('@/assets/images/party.svg?inline')"
              aspect-ratio="1"
              class="ml-md-n ml-md-0 ml-auto mb-n8 mb-md-0"
              contain
              width="100"
            />
            <h2
              :class="$style.header"
            >
              Loosen Up party
            </h2>
            <p>
              Osim na Meetupu, s predstavnicima poduzeća možeš se upoznati i na večernjoj zabavi koja se održava u KSET-u. Za dobru atmosferu pobrinula su se poduzeća koja su osigurala promotivne koktele tijekom
              cijele večeri, kao i Disco sekcija KSET-a koja će te svojim miksevima zadržati u ritmu plesa. Na dobroj zabavi pruža se prilika i za bolje upoznavanje. Zato se na vrijeme poveži sa svojim omiljenim
              poduzećem jer za prvi team building nikad nije prerano!
            </p>
          </v-col>
        </v-row>

        <v-row
          class="mb-n12"
        >
          <v-col
            cols="12"
            md="10"
            offset-md="1"
          >
            <v-img
              :src="require('@/assets/images/meet-illustration-3.svg?inline')"
              aspect-ratio="1"
              contain
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col
            cols="12"
          >
            <h2
              :class="$style.header"
            >
              Kako se mogu uključiti?
            </h2>

            <h3
              :class="$style.subHeader"
              class="mt-6"
            >
              CV kao ulaznica
            </h3>
            <p>
              Predaj svoj životopis u bazu životopisa Job Fair Meetupa putem naše aplikacije i osiguraj svoje mjesto na događaju. Osim što ti služi kao ulaznica, CV dolazi u ruke svih poduzeća sudionika Meetupa što
              ti povećava mogućnost poziva na intervju. Zato ga izbrusi na vrijeme uz naše savjete te zasjaji i offline i online!
            </p>

            <h3
              :class="$style.subHeader"
              class="mt-12"
            >
              QR kod kao posjetnica
            </h3>
            <p>
              Za ispunjeni predani životopis dobivaš jedinstveni QR kod na svoju adresu e-pošte. Tijekom Meetupa, svojim omiljenim poduzećima koje zainteresiraš kratkim pitchem možeš pokazati dobiveni QR kod kako bi
              te lakše pronašli među svim životopisima unutar baze. Povećaj si vidljivost i nabavi svoj QR kod na vrijeme!
            </p>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<script>
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";

  export default {
    name: "PageAbout",
    components: {
      AppMaxWidthContainer,
    },
    head: () => ({
      title: "O MeetUPu",
    }),
  };
</script>

<style lang="scss" module>
  @import "../assets/styles/include/all";

  .container {
    $gap: 2.5em;

    max-width: 700px;
    margin: #{$gap} auto 0;

    * {
      text-align: justify;
    }

    :global(.row) + :global(.row) {
      margin-top: $gap;
    }

    .mainHeader {
      font-size: 250%;
      font-weight: 800;
      text-align: center;
      text-transform: uppercase;
      color: $fer-dark-blue;
    }

    .header {
      font-size: 162.5%;
      font-weight: bold;
      margin: .4em auto;
      color: $fer-dark-blue;
    }

    .subHeader {
      font-size: 112.5%;
      font-weight: bold;
      margin: .5em auto;
      color: $fer-dark-blue;
    }

    .locationContainer {
      background-color: $fer-gray;

      .locationSubheader {
        font-size: 118.75%;
        opacity: .7;
      }

      .locationName {
        font-size: 162.5%;
        font-weight: bold;
        opacity: .7;
        color: $fer-black;
      }
    }

    .spacer {
      opacity: .5;
      border: 1px dashed $fer-black;
    }
  }
</style>
