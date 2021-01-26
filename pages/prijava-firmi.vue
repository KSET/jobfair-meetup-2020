<template>
  <app-max-width-container>
    <v-row>
      <v-col cols="12">
        <h1>Prijava firmi</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="vat.input"
          :disabled="vat.locked || vat.loading"
          :error-messages="vatError"
          :loading="vat.loading"
          :messages="vatMessage"
          :placeholder="vatError"
          :success="vat.valid === true"
          clearable
          hide-details="auto"
          label="OIB / VAT"
          outlined
          prepend-inner-icon="mdi-identifier"
        />
      </v-col>
    </v-row>

    <v-expand-transition>
      <v-row v-if="!vatError && !vat.loading && !vat.locked">
        <v-col class="text-center" cols="12">
          <v-btn
            :loading="company.loading || vat.loading"
            color="primary"
            @click.prevent="showForm"
          >
            Dodaj novo poduzeće
          </v-btn>
        </v-col>
      </v-row>
    </v-expand-transition>

    <v-expand-transition>
      <v-row
        v-if="vat.locked"
      >
        <v-col cols="12">
          <v-form
            ref="companyForm"
            v-model="company.formValid"
            :disabled="company.loading"
            lazy-validation
            @submit.prevent="submitForm"
          >
            <v-card :loading="company.loading">
              <v-card-title>
                Podatci o firmi
              </v-card-title>

              <v-card-text>
                <v-text-field
                  v-model="company.form.legalName"
                  :error-messages="formErrors.legalName"
                  label="Pravni naziv tvrtke"
                  placeholder="Elektrostudent d.o.o."
                  required
                  @blur="$v.company.form.legalName.$touch()"
                  @input="$v.company.form.legalName.$touch()"
                />

                <v-text-field
                  v-model="company.form.brandName"
                  :error-messages="formErrors.brandName"
                  label="Prikazani naziv tvrtke"
                  placeholder="Elektrostudent"
                  required
                  @blur="$v.company.form.brandName.$touch()"
                  @input="$v.company.form.brandName.$touch()"
                />

                <v-text-field
                  v-model="company.form.address"
                  :error-messages="formErrors.address"
                  label="Adresa"
                  placeholder="Unska ul. 4"
                  required
                  @blur="$v.company.form.address.$touch()"
                  @input="$v.company.form.address.$touch()"
                />

                <v-select
                  v-model="company.form.industryId"
                  :error-messages="formErrors.industryId"
                  :items="companyIndustries"
                  label="Industrija"
                  required
                  @blur="$v.company.form.industryId.$touch()"
                  @input="$v.company.form.industryId.$touch()"
                />

                <v-textarea
                  v-model="company.form.description"
                  :error-messages="formErrors.description"
                  auto-grow
                  counter
                  label="Opis tvrtke"
                  placeholder="Tvrtka se bavi dizajnom i integracijom..."
                  required
                  rows="2"
                  @blur="$v.company.form.description.$touch()"
                  @input="$v.company.form.description.$touch()"
                />

                <v-text-field
                  v-model="company.form.homepageUrl"
                  :error-messages="formErrors.homepageUrl"
                  label="Adresa web stranice"
                  placeholder="https://www.kset.org"
                  required
                  @blur="$v.company.form.homepageUrl.$touch()"
                  @input="$v.company.form.homepageUrl.$touch()"
                />

                <v-file-input
                  v-model="company.form.logo"
                  :error-messages="formErrors.logo"
                  accept="image/png"
                  label="Logo"
                  placeholder="Logotip u .png formatu"
                  show-size
                  @blur="$v.company.form.logo.$touch()"
                  @input="$v.company.form.logo.$touch()"
                />

                <v-file-input
                  v-model="company.form.vectorLogo"
                  :error-messages="formErrors.vectorLogo"
                  accept="application/zip"
                  label="Vektorski logo"
                  placeholder="Logotip u .zip formatu"
                  show-size
                  @blur="$v.company.form.vectorLogo.$touch()"
                  @input="$v.company.form.vectorLogo.$touch()"
                />

                <v-card class="mt-4">
                  <v-card-title>
                    Talk
                  </v-card-title>

                  <v-card-subtitle>
                    Talk studentima u trajanju od 90 minuta
                  </v-card-subtitle>

                  <v-expand-transition>
                    <v-card-text
                      v-if="companyExtras.talk.chosen"
                    >
                      <v-text-field
                        v-model="companyExtras.talk.form.title"
                        :error-messages="formExtrasErrors.talk.title"
                        label="Naslov talka"
                        placeholder="Internet of Tulum Things"
                        required
                        @blur="$v.companyExtras.talk.form.title.$touch()"
                        @input="$v.companyExtras.talk.form.title.$touch()"
                      />

                      <v-textarea
                        v-model="companyExtras.talk.form.description"
                        :error-messages="formExtrasErrors.talk.description"
                        auto-grow
                        counter
                        label="Opis talka"
                        placeholder="U našoj tvrtci gadgeti i tehnologija su u primjeni na projektima za naše klijente no nerijetko i u službi internih tuluma! ..."
                        required
                        rows="2"
                        @blur="$v.companyExtras.talk.form.description.$touch()"
                        @input="$v.companyExtras.talk.form.description.$touch()"
                      />

                      <v-text-field
                        v-model="companyExtras.talk.form.topic"
                        :error-messages="formExtrasErrors.talk.topic"
                        label="Tema talka"
                        required
                        @blur="$v.companyExtras.talk.form.topic.$touch()"
                        @input="$v.companyExtras.talk.form.topic.$touch()"
                      />

                      <v-file-input
                        v-model="companyExtras.talk.form.image"
                        accept="image/png, image/jpeg, image/gif"
                        label="Fotografija predavača"
                        show-size
                      />

                      <v-textarea
                        v-model="companyExtras.talk.form.biography"
                        auto-grow
                        counter
                        label="Kratka biografija predavača"
                        placeholder="Kratka biografija predavača..."
                        required
                        rows="2"
                      />
                    </v-card-text>
                  </v-expand-transition>

                  <v-card-actions>
                    <v-btn
                      v-if="!companyExtras.talk.chosen"
                      color="primary"
                      outlined
                      @click="showCompanyExtrasForm('talk')"
                    >
                      Prijavi talk
                    </v-btn>
                    <v-btn
                      v-else
                      color="error"
                      icon
                      @click="resetCompanyExtrasForm('talk')"
                    >
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </v-card-actions>
                </v-card>

                <v-card class="mt-4">
                  <v-card-title>
                    Radionica
                  </v-card-title>

                  <v-card-subtitle>
                    Interaktivna radionica sa studentima u trajanju od 90 minuta
                  </v-card-subtitle>

                  <v-expand-transition>
                    <v-card-text
                      v-if="companyExtras.workshop.chosen"
                    >
                      <v-text-field
                        v-model="companyExtras.workshop.form.title"
                        :error-messages="formExtrasErrors.workshop.title"
                        label="Naslov radionice"
                        placeholder="Izradi svoju prvu iOS aplikaciju u 90 minuta koristeći Swift"
                        required
                        @blur="$v.companyExtras.workshop.form.title.$touch()"
                        @input="$v.companyExtras.workshop.form.title.$touch()"
                      />

                      <v-textarea
                        v-model="companyExtras.workshop.form.description"
                        :error-messages="formExtrasErrors.workshop.description"
                        auto-grow
                        counter
                        label="Opis radionice"
                        placeholder="From zero to hero! Ova radionca je prilagođena za početnike. Naučit ćeš osnove Swifta i napraviti jednostavu iOS aplikaciju u 90 minuta ..."
                        required
                        rows="2"
                        @blur="$v.companyExtras.workshop.form.description.$touch()"
                        @input="$v.companyExtras.workshop.form.description.$touch()"
                      />
                    </v-card-text>
                  </v-expand-transition>

                  <v-card-actions>
                    <v-btn
                      v-if="!companyExtras.workshop.chosen"
                      color="primary"
                      outlined
                      @click="showCompanyExtrasForm('workshop')"
                    >
                      Prijavi radionicu
                    </v-btn>
                    <v-btn
                      v-else
                      color="error"
                      icon
                      @click="resetCompanyExtrasForm('workshop')"
                    >
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </v-card-actions>
                </v-card>

                <v-card class="mt-4">
                  <v-card-title>Panel</v-card-title>

                  <v-card-subtitle>Panel rasprava sa studentom i drugim firmama ili članovima fakulteta</v-card-subtitle>

                  <v-card-text>
                    <v-checkbox
                      v-model="companyExtras.panel.interested"
                      color="primary"
                      label="Zainteresirani smo za potencijalno sudjelovanje na jednom od panela"
                    />
                  </v-card-text>
                </v-card>
              </v-card-text>

              <v-card-actions>
                <span class="px-3 text--secondary font-weight-light" style="max-width: 80%;">Slanjem ove prijave potvrđujem da su svi navedeni podatci istiniti i točni te sam ovlašten za zastupanje interesa poduzeća
                  koje prijavljujem na Job Fair Meetup</span>

                <v-spacer />

                <v-btn
                  :disabled="!company.formValid"
                  class="mr-4"
                  color="primary"
                  x-large
                  @click="submitForm"
                >
                  Pošalji prijavu
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-form>
        </v-col>
      </v-row>
    </v-expand-transition>
  </app-max-width-container>
</template>

<router>
name: PagePrijavaFirmi
</router>

<script>
  import {
    mapActions,
  } from "vuex";
  import {
    checkVAT,
    countries,
  } from "jsvat";
  import * as RandExp from "randexp";
  import {
    validationMixin,
  } from "vuelidate";
  import {
    required,
    minLength,
    url,
  } from "vuelidate/lib/validators";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";

  const countriesWithoutBrazil = countries.filter(({ name }) => "Brazil" !== name);

  const companyForm = () => ({
    legalName: "",
    brandName: "",
    address: "",
    industryId: 0,
    description: "",
    homepageUrl: "",
    logo: null,
    vectorLogo: null,
  });

  const companyExtrasForm = () => ({
    talk: {
      chosen: false,
      form: {
        title: "",
        description: "",
        topic: "",
        image: null,
        biography: "",
      },
    },

    workshop: {
      chosen: false,
      form: {
        title: "",
        description: "",
      },
    },

    panel: {
      interested: false,
    },
  });

  export default {
    name: "PagePrijavaFirmi",

    components: {
      AppMaxWidthContainer,
    },

    mixins: [
      validationMixin,
    ],

    validations: {
      company: {
        form: {
          legalName: {
            required,
          },
          brandName: {
            required,
          },
          address: {
            required,
          },
          industryId: {
            required,
          },
          description: {
            required,
            minLength: minLength(100),
          },
          homepageUrl: {
            required,
            url,
          },
          logo: {
            required,
          },
          vectorLogo: {
            required,
          },
        },
      },

      companyExtras: {
        talk: {
          form: {
            title: {
              required,
            },

            description: {
              required,
              minLength: minLength(100),
            },

            topic: {
              required,
            },
          },
        },

        workshop: {
          form: {
            title: {
              required,
            },

            description: {
              required,
              minLength: minLength(100),
            },
          },
        },
      },
    },

    async asyncData({ store }) {
      return {
        companyIndustries: (await store.dispatch("company/getIndustries")).map(({ id, name }) => ({ value: Number(id), text: name })),
      };
    },

    data: () => ({
      vat: {
        // input: "HR54608519877",
        // input: "HR53943536946",
        input: "",
        locked: false,
        loading: false,
        invalid: false,
      },
      company: {
        data: null,
        loading: false,
        formValid: true,
        form: companyForm(),
      },

      companyExtras: companyExtrasForm(),
    }),

    computed: {
      vatValid() {
        return this.vatInfo.isValid;
      },

      vatValidFormat() {
        return this.vatInfo.isValidFormat;
      },

      vatError() {
        if (this.vat.invalid) {
          return "VAT broj nije valjan";
        }

        if (this.vatValidFormat) {
          return "";
        }

        const { country } = this.vatInfo;

        if (!country) {
          return "Potrebno je navesti valjan VAT/OIB (npr. HR57029260362)";
        }

        const regex = (() => {
          const info = countriesWithoutBrazil.find(({ name }) => name === country.name);

          if (!info) {
            return "";
          }

          const { rules } = info;
          const [ regex ] = rules.regex;

          return regex;
        })();

        if (!regex) {
          return `Potrebno je navesti valjan VAT (npr. ${ country.isoCode.short }XXXXXXXXXXX)`;
        }

        return `Potrebno je navesti valjan VAT (npr. ${ RandExp.randexp(regex) })`;
      },

      vatMessage() {
        if (!this.vatValidFormat) {
          return "";
        }

        if (!this.vatValid) {
          return "VAT je u dobrom formatu, ali vjerojatno nije valjan";
        }

        return "";
      },

      vatInfo() {
        return checkVAT(this.vat.input, countriesWithoutBrazil);
      },

      formErrors() {
        return Object.fromEntries(
          Object
            .keys(this.company.form)
            .filter((key) => key in this.$v.company.form)
            .map((key) => {
              const $e = this.$v.company.form[key];

              if (!$e.$error) {
                return [ key, [] ];
              }

              const errors = [];
              for (const { type, ...args } of Object.values($e.$params)) {
                if (!$e[type]) {
                  errors.push(this.translateError(type, args));
                }
              }

              return [ key, errors ];
            })
          ,
        );
      },

      formExtrasErrors() {
        return Object.fromEntries(
          Object
            .keys(this.companyExtras)
            .filter(($key) => this.companyExtras[$key].form && $key in this.$v.companyExtras)
            .map(($key) => {
              // eg. key = talk

              const subFormErrors = Object.fromEntries(
                Object
                  .keys(this.companyExtras[$key].form)
                  .filter((key) => key in this.$v.companyExtras[$key].form)
                  .map((key) => {
                    const $e = this.$v.companyExtras[$key].form[key];

                    if (!$e.$error) {
                      return [ key, [] ];
                    }

                    const errors = [];
                    for (const { type, ...args } of Object.values($e.$params)) {
                      if (!$e[type]) {
                        errors.push(this.translateError(type, args));
                      }
                    }

                    return [ key, errors ];
                  })
                ,
              );

              return [
                $key,
                subFormErrors,
              ];
            }),
        );
      },
    },

    watch: {
      "vat.input"() {
        this.vat.invalid = false;
      },

      vatValidFormat: {
        async handler(isValid) {
          if (!isValid) {
            return;
          }

          if (this.vatValid || this.company.data) {
            return;
          }

          await this.validateVat();
        },

        immediate: true,
      },
    },

    mounted() {
      if (this.vatValid) {
        this.showForm();
      }
    },

    methods: {
      ...mapActions({
        isVatValid: "company/isVatValid",
        getCompanyFromVat: "company/getDataFromVat",
      }),

      showCompanyExtrasForm(name) {
        this.resetCompanyExtrasForm(name);
        this.companyExtras[name].chosen = true;
      },

      resetCompanyExtrasForm(name) {
        const { [name]: form } = companyExtrasForm();

        if (name in this.$v.companyExtras) {
          this.$v.companyExtras[name].$reset();
        }

        this.$set(this.companyExtras, name, form);
      },

      async submitForm() {
        this.$v.$touch();
        await this.$nextTick();

        if (!this.company.formValid) {
          return;
        }

        alert("Submit");
      },

      async showForm() {
        await this.validateVat();

        this.vat.locked = true;

        this.company.loading = true;

        const data = await this.getCompanyFromVat({ vat: this.vat.input });
        this.$set(this.company, "data", data);

        if (data) {
          for (const [ key, value ] of Object.entries(data)) {
            if (key in this.company.form) {
              this.company.form[key] = value;
            }
          }
        }

        this.company.loading = false;
      },

      async validateVat() {
        this.vat.loading = true;
        const { remote } = await this.isVatValid({ vat: this.vat.input });
        this.vat.loading = false;

        this.vat.invalid = !remote;
      },

      translateError(error, args) {
        switch (error) {
          case "required":
            return "Polje je obavezno";
          case "minLength":
            return `Mora biti minimalno ${ args.min } znakova`;
          case "url":
            return "Mora biti URL (npr https://www.kset.org)";
          default:
            return error.slice(0, 1).toUpperCase() + error.slice(1);
        }
      },
    },
  };
</script>
