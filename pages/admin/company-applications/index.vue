<template>
  <app-max-width-container>
    <v-row>
      <v-col>
        <h1>Company applications</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-btn
          :to="{ name: 'PageAdminIndex' }"
          exact
        >
          <v-icon left>
            mdi-arrow-left
          </v-icon>
          Back
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-btn
          text
          :class="{
            'font-weight-bold': filterBy === null
          }"
          @click="setFilter(null)"
        >
          Prijava: {{ applicationCounts.total }}
        </v-btn>

        <ul style="list-style: none;">
          <li>
            <v-btn
              text
              :class="{
                'font-weight-bold': filterBy === 'talk'
              }"
              @click="setFilter('talk')"
            >
              Talk: {{ applicationCounts.talks }}
            </v-btn>
          </li>
          <li>
            <v-btn
              text
              :class="{
                'font-weight-bold': filterBy === 'workshop'
              }"
              @click="setFilter('workshop')"
            >
              Workshop: {{ applicationCounts.workshops }}
            </v-btn>
          </li>
          <li>
            <v-btn
              text
              :class="{
                'font-weight-bold': filterBy === 'panelInterested'
              }"
              @click="setFilter('panelInterested')"
            >
              Panel: {{ applicationCounts.panels }}
            </v-btn>
          </li>
        </ul>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="application in filteredApplications"
        :key="application.id"
        cols="6"
        lg="3"
        md="4"
      >
        <v-card>
          <v-img
            :src="application.logo.default.url"
            aspect-ratio="1.78"
            contain
          />

          <v-card-title v-text="application.brandName" />

          <v-card-text class="pb-0">
            <div class="d-flex justify-space-around">
              <v-tooltip
                v-for="{ name, icon, chosen } in applicationParts(application)"
                :key="name"
                top
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-chip
                    v-bind="attrs"
                    :color="chosen ? 'primary' : 'default'"
                    label
                    v-on="on"
                  >
                    <v-icon v-text="icon" />
                  </v-chip>
                </template>
                <span v-text="name" />
              </v-tooltip>
            </div>

            <v-divider class="mt-4" />

            <v-card-subtitle>
              Kontakt
            </v-card-subtitle>

            <v-card-text>
              Ime: <span
                class="font-weight-bold text--primary"
                v-text="application.contactName"
              />
              <br>
              Email: <a
                :href="`mailto:${encodeURI(application.contactEmail)}`"
                class="font-weight-bold text--primary"
                rel="noopener noreferrer"
                target="_blank"
                v-text="application.contactEmail"
              />
              <br>
              Telefon: <a
                :href="`tel:${encodeURI(application.contactPhone)}`"
                class="font-weight-bold text--primary"
                v-text="application.contactPhone"
              />
            </v-card-text>
          </v-card-text>

          <v-card-actions>
            <v-spacer />

            <v-btn
              icon
              @click="dialog.application = application"
            >
              <v-icon
                v-text="dialog.application === application ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'"
              />
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog
      v-if="dialog.application"
      v-model="dialog.application"
      max-width="90vw"
      scrollable
    >
      <v-card class="pa-3">
        <v-card-title v-text="dialog.application.brandName" />

        <v-card-text>
          <v-card>
            <v-card-text>
              <v-text-field
                :value="dialog.application.oib"
                label="VAT"
                readonly
              />

              <v-text-field
                :value="dialog.application.legalName"
                label="Pravni naziv tvrtke"
                readonly
              />

              <v-text-field
                :value="dialog.application.brandName"
                label="Prikazani naziv tvrtke"
                readonly
              />

              <v-text-field
                :value="dialog.application.contactName"
                label="Ime kontakt osobe"
                readonly
              />

              <v-text-field
                :value="dialog.application.contactEmail"
                label="Email kontakt osobe"
                readonly
              />

              <v-text-field
                :value="dialog.application.contactPhone"
                label="Broj telefona kontakt osobe"
                readonly
              />

              <v-text-field
                :value="dialog.application.address"
                label="Adresa"
                readonly
              />

              <v-select
                :items="companyIndustries"
                :value="dialog.application.industryId"
                label="Industrija"
                readonly
              />

              <v-textarea
                :value="dialog.application.description"
                counter
                label="Opis tvrtke"
                readonly
                rows="3"
              />

              <v-text-field
                :value="dialog.application.website"
                label="Adresa web stranice"
                readonly
              />

              <v-btn
                :href="dialog.application.vectorLogo.url"
                block
                target="_blank"
              >
                Vektorski logo ({{ humanFileSize(dialog.application.vectorLogo.size) }})
              </v-btn>

              <v-card
                v-if="dialog.application.talk"
                class="mt-4"
              >
                <v-card-title>Talk</v-card-title>

                <v-card-text>
                  <v-text-field
                    :value="dialog.application.talk.title"
                    label="Naslov talka"
                    readonly
                  />

                  <v-textarea
                    :value="dialog.application.talk.description"
                    counter
                    label="Opis talka"
                    readonly
                    rows="3"
                  />

                  <v-select
                    :items="talkTopics"
                    :value="dialog.application.talk.topic"
                    label="Tema talka"
                    readonly
                  />

                  <v-row>
                    <v-col
                      class="d-flex text-center"
                      cols="12"
                    >
                      <h4 class="ma-0 pa-0">
                        Fotografija predavača
                      </h4>
                    </v-col>
                    <v-col cols="12">
                      <v-img
                        :src="dialog.application.talk.presenterPhoto.default.url"
                        aspect-ratio="1"
                        contain
                        width="100px"
                      />
                    </v-col>
                  </v-row>

                  <v-textarea
                    :value="dialog.application.talk.presenterDescription"
                    counter
                    label="Kratka biografija predavača"
                    readonly
                    rows="3"
                  />
                </v-card-text>
              </v-card>

              <v-card
                v-if="dialog.application.workshop"
                class="mt-4"
              >
                <v-card-title>Workshop</v-card-title>

                <v-card-text>
                  <v-text-field
                    :value="dialog.application.workshop.title"
                    label="Naslov radionice"
                    readonly
                  />

                  <v-textarea
                    :value="dialog.application.workshop.description"
                    counter
                    label="Opis radionice"
                    readonly
                    rows="3"
                  />

                  <v-textarea
                    :value="dialog.application.workshop.goal"
                    counter
                    label="Cilj radionice"
                    readonly
                    rows="3"
                  />

                  <v-textarea
                    :value="dialog.application.workshop.biography"
                    counter
                    label="Kratka biografija voditelja radionice"
                    readonly
                    rows="3"
                  />

                  <v-textarea
                    :value="dialog.application.workshop.notes"
                    counter
                    label="Dodatne napomene"
                    readonly
                    rows="3"
                  />
                </v-card-text>
              </v-card>

              <v-card class="mt-4">
                <v-card-title>Panel</v-card-title>

                <v-card-text>
                  <v-checkbox
                    v-model="dialog.application.panelInterested"
                    color="primary"
                    label="Zainteresirani smo za potencijalno sudjelovanje na jednom od panela*"
                    readonly
                  />
                </v-card-text>
              </v-card>
            </v-card-text>
          </v-card>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            color="success"
            large
            text
            @click="dialog.application = null"
          >
            Zatvori
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </app-max-width-container>
</template>

<router>
name: PageAdminCompanyApplicationsList
</router>

<script>
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";
  import {
    TOPICS as TALK_TOPICS,
  } from "~/helpers/talk";
  import {
    bytesToHumanReadable,
  } from "~/helpers/image";

  export default {
    components: {
      AppMaxWidthContainer,
    },

    async asyncData({ store }) {
      return {
        applications:
          (await store.dispatch("company/getCompanyApplicationsAll"))
            .map(
              (company) =>
                Object.assign(
                  company,
                  {
                    $info: {
                      open: true,
                    },
                  },
                )
              ,
            ),
        companyIndustries:
          (await store.dispatch("company/getIndustries"))
            .map(
              ({ id, name }) => ({
                value: Number(id),
                text: name,
              })
              ,
            ),

        dialog: {
          application: null,
        },

        filterBy: null,
      };
    },

    computed: {
      talkTopics() {
        return TALK_TOPICS;
      },

      applicationCounts() {
        const { applications } = this;

        return {
          total: applications.length,
          talks: applications.filter(({ talk }) => talk).length,
          workshops: applications.filter(({ workshop }) => workshop).length,
          panels: applications.filter(({ panelInterested }) => panelInterested).length,
        };
      },

      filteredApplications() {
        const field = this.filterBy;

        if (!field) {
          return this.applications;
        }

        return this.applications.filter((application) => application[field]);
      },
    },

    methods: {
      applicationParts(application) {
        return [
          {
            name: "Talk",
            icon: "mdi-account-tie-voice",
            chosen: application.talk,
          },
          {
            name: "Workshop",
            icon: "mdi-briefcase-variant",
            chosen: application.workshop,
          },
          {
            name: "Panel",
            icon: "mdi-human-queue",
            chosen: application.panelInterested,
          },
        ];
      },

      humanFileSize: bytesToHumanReadable,

      setFilter(type) {
        if (this.filterBy === type) {
          this.filterBy = null;
        } else {
          this.filterBy = type;
        }
      },
    },
  };
</script>
