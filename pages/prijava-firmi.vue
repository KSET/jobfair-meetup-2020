<template>
  <app-max-width-container>
    <v-row>
      <v-col cols="12">
        <h1>
          <translated-text trans-key="prijavaFirmi.header" />
        </h1>
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
          label="VAT"
          outlined
          prepend-inner-icon="mdi-identifier"
        />
      </v-col>
    </v-row>

    <v-expand-transition>
      <v-row v-if="company.applications && company.applications.length > 0">
        <v-col cols="12">
          <v-alert
            border="left"
            outlined
            type="warning"
          >
            Za ovu firmu postoj{{ String(company.applications.length).endsWith("1") ? "i" : "e" }}
            već {{ company.applications.length }} prijav{{ String(company.applications.length).endsWith("1") ? "a" : "e" }}
            ({{ company.applications.map(({ createdAt }) => new Date(createdAt).toLocaleString("hr-HR")).join(", ") }})
          </v-alert>
        </v-col>
      </v-row>
    </v-expand-transition>

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
                  :label="labels.legalName"
                  placeholder="Elektrostudent d.o.o."
                  required
                  @blur="$v.company.form.legalName.$touch()"
                  @input="$v.company.form.legalName.$touch()"
                />

                <v-text-field
                  v-model="company.form.brandName"
                  :error-messages="formErrors.brandName"
                  :label="labels.legalName"
                  placeholder="Elektrostudent"
                  required
                  @blur="$v.company.form.brandName.$touch()"
                  @input="$v.company.form.brandName.$touch()"
                />

                <v-text-field
                  v-model="company.form.address"
                  :error-messages="formErrors.address"
                  :label="labels.address"
                  placeholder="Unska ul. 4"
                  required
                  @blur="$v.company.form.address.$touch()"
                  @input="$v.company.form.address.$touch()"
                />

                <v-text-field
                  v-model="company.form.contactName"
                  :error-messages="formErrors.contactName"
                  :label="labels.contactName"
                  placeholder="Marko Horvat"
                  required
                  @blur="$v.company.form.contactName.$touch()"
                  @input="$v.company.form.contactName.$touch()"
                />

                <v-text-field
                  v-model="company.form.contactEmail"
                  :error-messages="formErrors.contactEmail"
                  :label="labels.contactEmail"
                  placeholder="info@kset.org"
                  required
                  @blur="$v.company.form.contactEmail.$touch()"
                  @input="$v.company.form.contactEmail.$touch()"
                />

                <v-text-field
                  v-model="company.form.contactPhone"
                  :error-messages="formErrors.contactPhone"
                  :label="labels.contactPhone"
                  placeholder="+385 99 123 4567"
                  required
                  @blur="$v.company.form.contactPhone.$touch()"
                  @input="$v.company.form.contactPhone.$touch()"
                />

                <v-select
                  v-model="company.form.industryId"
                  :error-messages="formErrors.industryId"
                  :items="companyIndustries"
                  :label="labels.industryId"
                  required
                  @blur="$v.company.form.industryId.$touch()"
                  @input="$v.company.form.industryId.$touch()"
                />

                <v-textarea
                  v-model="company.form.description"
                  :error-messages="formErrors.description"
                  auto-grow
                  counter
                  :label="labels.description"
                  placeholder="Tvrtka se bavi dizajnom i integracijom..."
                  required
                  rows="2"
                  @blur="$v.company.form.description.$touch()"
                  @input="$v.company.form.description.$touch()"
                />

                <v-text-field
                  v-model="company.form.homepageUrl"
                  :error-messages="formErrors.homepageUrl"
                  :label="labels.homepageUrl"
                  placeholder="https://www.kset.org"
                  required
                  @blur="$v.company.form.homepageUrl.$touch()"
                  @input="$v.company.form.homepageUrl.$touch()"
                />

                <v-file-input
                  v-model="company.form.logo"
                  :error-messages="formErrors.logo"
                  accept="image/png"
                  :label="labels.logo"
                  placeholder="Logotip u .png formatu"
                  show-size
                  @blur="$v.company.form.logo.$touch()"
                  @input="$v.company.form.logo.$touch()"
                />

                <v-file-input
                  v-model="company.form.vectorLogo"
                  :error-messages="formErrors.vectorLogo"
                  accept="application/zip"
                  :label="labels.vectorLogo"
                  placeholder="Vektorski logotip u .zip formatu (.zip koji sadrži .eps, .pdf i/ili .ai datoteke)"
                  show-size
                  @blur="$v.company.form.vectorLogo.$touch()"
                  @input="$v.company.form.vectorLogo.$touch()"
                />

                <v-card class="mt-4">
                  <v-card-title>
                    <translated-text trans-key="prijavaFirmi.talk.title" />
                  </v-card-title>

                  <v-card-subtitle>
                    <translated-text trans-key="prijavaFirmi.talk.description" />
                  </v-card-subtitle>

                  <v-expand-transition>
                    <v-card-text
                      v-if="companyExtras.talk.chosen"
                    >
                      <v-text-field
                        v-model="companyExtras.talk.form.title"
                        :error-messages="formExtrasErrors.talk.title"
                        :label="labels.talk.title"
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
                        :label="`${labels.talk.description}*`"
                        placeholder="U našoj tvrtci gadgeti i tehnologija su u primjeni na projektima za naše klijente no nerijetko i u službi internih tuluma! ..."
                        required
                        rows="2"
                        @blur="$v.companyExtras.talk.form.description.$touch()"
                        @input="$v.companyExtras.talk.form.description.$touch()"
                      />

                      <v-select
                        v-model="companyExtras.talk.form.topic"
                        :error-messages="formExtrasErrors.talk.topic"
                        :items="talkTopics"
                        :label="labels.talk.topic"
                        required
                        @blur="$v.companyExtras.talk.form.topic.$touch()"
                        @input="$v.companyExtras.talk.form.topic.$touch()"
                      />

                      <v-file-input
                        v-model="companyExtras.talk.form.image"
                        :error-messages="formExtrasErrors.talk.image"
                        accept="image/png, image/jpeg, image/gif"
                        :label="labels.talk.image"
                        show-size
                        @blur="$v.companyExtras.talk.form.image.$touch()"
                        @input="$v.companyExtras.talk.form.image.$touch()"
                      />

                      <v-textarea
                        v-model="companyExtras.talk.form.biography"
                        :error-messages="formExtrasErrors.talk.biography"
                        auto-grow
                        counter
                        :label="labels.talk.biography"
                        placeholder="Kratka biografija predavača..."
                        required
                        rows="2"
                        @blur="$v.companyExtras.talk.form.biography.$touch()"
                        @input="$v.companyExtras.talk.form.biography.$touch()"
                      />

                      <translated-text
                        :class="$style.prependStar"
                        trans-key="prijavaFirmi.talk.notice"
                      />
                    </v-card-text>
                  </v-expand-transition>

                  <v-card-actions>
                    <v-btn
                      v-if="!companyExtras.talk.chosen"
                      :disabled="company.loading"
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
                    <translated-text trans-key="prijavaFirmi.workshop.title" />
                  </v-card-title>

                  <v-card-subtitle>
                    <translated-text trans-key="prijavaFirmi.workshop.description" />
                  </v-card-subtitle>

                  <v-expand-transition>
                    <v-card-text
                      v-if="companyExtras.workshop.chosen"
                    >
                      <v-text-field
                        v-model="companyExtras.workshop.form.title"
                        :error-messages="formExtrasErrors.workshop.title"
                        :label="labels.workshop.title"
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
                        :label="`${labels.workshop.description}*`"
                        placeholder="From zero to hero! Ova radionca je prilagođena za početnike. Naučit ćeš osnove Swifta i napraviti jednostavu iOS aplikaciju u 90 minuta ..."
                        required
                        rows="2"
                        @blur="$v.companyExtras.workshop.form.description.$touch()"
                        @input="$v.companyExtras.workshop.form.description.$touch()"
                      />

                      <v-textarea
                        v-model="companyExtras.workshop.form.goal"
                        :error-messages="formExtrasErrors.workshop.goal"
                        auto-grow
                        counter
                        :label="`${labels.workshop.goal}*`"
                        placeholder="Naučiti osnove Swifta i napraviti jednostavu iOS aplikaciju u 90 minuta"
                        required
                        rows="2"
                        @blur="$v.companyExtras.workshop.form.goal.$touch()"
                        @input="$v.companyExtras.workshop.form.goal.$touch()"
                      />

                      <v-textarea
                        v-model="companyExtras.workshop.form.biography"
                        :error-messages="formExtrasErrors.workshop.biography"
                        auto-grow
                        counter
                        :label="labels.workshop.biography"
                        placeholder="Kratka biografija voditelja radionice..."
                        required
                        rows="2"
                        @blur="$v.companyExtras.workshop.form.biography.$touch()"
                        @input="$v.companyExtras.workshop.form.biography.$touch()"
                      />

                      <v-textarea
                        v-model="companyExtras.workshop.form.notes"
                        :error-messages="formExtrasErrors.workshop.notes"
                        auto-grow
                        counter
                        :label="labels.workshop.notes"
                        placeholder="Dodatne napomene za studente i organizatore. Npr. treba ponijeti laptop, treba ima instaliran program XY, itd."
                        required
                        rows="2"
                        @blur="$v.companyExtras.workshop.form.goal.$touch()"
                        @input="$v.companyExtras.workshop.form.goal.$touch()"
                      />

                      <translated-text
                        :class="$style.prependStar"
                        trans-key="prijavaFirmi.workshop.notice"
                      />
                    </v-card-text>
                  </v-expand-transition>

                  <v-card-actions>
                    <v-btn
                      v-if="!companyExtras.workshop.chosen"
                      :disabled="company.loading"
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
                  <v-card-title>
                    <translated-text trans-key="prijavaFirmi.panel.title" />
                  </v-card-title>

                  <v-card-subtitle>
                    <translated-text trans-key="prijavaFirmi.panel.description" />
                  </v-card-subtitle>

                  <v-card-text>
                    <v-checkbox
                      v-model="companyExtras.panel.chosen"
                      color="primary"
                      :label="`${labels.panel.chosen}*`"
                    />

                    <translated-text
                      :class="$style.prependStar"
                      trans-key="prijavaFirmi.panel.notice"
                    />
                  </v-card-text>
                </v-card>
              </v-card-text>

              <v-card-actions>
                <span class="px-4 py-2 text--secondary font-weight-light">
                  <translated-text trans-key="prijavaFirmi.submit.notice" />
                </span>

                <v-spacer />

                <v-btn
                  :disabled="!company.formValid"
                  :loading="company.loading"
                  class="mr-4"
                  color="primary"
                  x-large
                  @click="submitForm"
                >
                  Pošalji prijavu
                </v-btn>
              </v-card-actions>

              <v-expand-transition>
                <v-card-text
                  v-if="!company.formValid"
                  class="px-6 py-3 pt-0 text-right red--text"
                >
                  Prijava sadrži greške. Molimo provjerite jesu li svi podatci pravilno upisani.
                </v-card-text>
              </v-expand-transition>
            </v-card>
          </v-form>
        </v-col>
      </v-row>
    </v-expand-transition>

    <v-dialog
      v-model="formSubmit.dialog"
      persistent
      width="500"
    >
      <v-card>
        <v-card-title v-if="formSubmit.isError">
          Dogodila se greška
        </v-card-title>
        <v-card-title v-else>
          Prijava uspješna
        </v-card-title>

        <v-card-text
          style="white-space: break-spaces;"
          v-text="formSubmit.message"
        />

        <v-card-actions>
          <v-spacer />

          <v-btn
            color="green darken-1"
            text
            @click.stop="closeFormSubmitDialog(!formSubmit.isError)"
          >
            Ok
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </app-max-width-container>
</template>

<router>
name: PagePrijavaFirmi
</router>

<script>
  import {
    checkVAT,
    countries,
  } from "jsvat";
  import * as RandExp from "randexp";
  import {
    validationMixin,
  } from "vuelidate";
  import {
    mapActions,
    mapGetters,
  } from "vuex";
  import {
    companyExtrasFormInputs,
    companyExtrasFormLabels,
    companyExtrasFormValidations,
    companyFormInputs,
    companyFormLabels,
    companyFormValidations,
  } from "~/helpers/company-applications";
  import {
    generateMetadata,
  } from "~/helpers/head";
  import {
    bytesToHumanReadable,
  } from "~/helpers/image";
  import {
    TOPICS as TALK_TOPICS,
  } from "~/helpers/talk";
  import TranslatedText from "~/components/TranslatedText";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";

  const countriesWithoutBrazil = countries.filter(({ name }) => "Brazil" !== name);

  const formLabels = {
    ...companyFormLabels(),
    ...companyExtrasFormLabels(),
  };

  export default {
    name: "PagePrijavaFirmi",

    components: {
      TranslatedText,
      AppMaxWidthContainer,
    },

    mixins: [
      validationMixin,
    ],

    validations: {
      company: {
        form: companyFormValidations(),
      },

      companyExtras: companyExtrasFormValidations(),
    },

    async asyncData({ store }) {
      return {
        companyIndustries: (await store.dispatch("company/getIndustries")).map(({ id, name }) => ({ value: Number(id), text: name })),
      };
    },

    async validate({ store, query }) {
      const getSetting = store.getters["settings/getSetting"];

      const enabledForAll = "yes" === String(getSetting("Company Applications Enabled", "no")).toLowerCase();

      if (enabledForAll) {
        return true;
      }

      const { token } = query;

      if (!token) {
        return false;
      }

      return await store.dispatch("company/checkCompanyApplicationTokenValid", {
        token,
      });
    },

    data: () => ({
      formSubmit: {
        dialog: false,
        isError: false,
        message: "",
      },

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
        form: companyFormInputs(),
        applications: [],
      },

      companyExtras: companyExtrasFormInputs(),

      labels: formLabels,
    }),

    computed: {
      ...mapGetters("translations", [
        "capitalizedTranslation",
      ]),

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
          return "Potrebno je navesti valjan VAT (npr. HR57029260362)";
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

      talkTopics() {
        return TALK_TOPICS;
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
        submitCompanyApplication: "company/submitCompanyApplication",
        getCompanyApplications: "company/getCompanyApplications",
      }),

      showCompanyExtrasForm(name) {
        this.resetCompanyExtrasForm(name);
        this.companyExtras[name].chosen = true;
      },

      resetCompanyExtrasForm(name) {
        const { [name]: form } = companyExtrasFormInputs();

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

        const formData = new FormData();

        formData.set("oib", this.vat.input);
        formData.set("token", this.$route.query.token);

        for (const [ key, value ] of Object.entries(this.company.form)) {
          formData.set(key, value);
        }

        for (const $key of Object.keys(this.companyExtras)) {
          const { form, chosen } = this.companyExtras[$key];

          if (!chosen) {
            continue;
          }

          for (const [ key, value ] of Object.entries(form)) {
            formData.set(`${ $key }[${ key }]`, value);
          }
        }

        this.company.loading = true;
        try {
          const {
            error,
            reason,
            status,
            errorData,
          } = await this.submitCompanyApplication(formData);

          this.formSubmit.isError = Boolean(error);
          this.formSubmit.dialog = true;

          if (error) {
            if (417 === status) {
              const validationError = this.toErrorText(errorData);
              this.formSubmit.message = `${ reason }\n${ validationError }`;
            } else {
              this.formSubmit.message = reason;
            }
          } else {
            this.formSubmit.message = "Prijava uspješno zaprimljena";
          }
        } finally {
          this.company.loading = false;
        }
      },

      async showForm() {
        await this.validateVat();

        this.vat.locked = true;

        this.company.loading = true;

        const vat = String(this.vat.input).trim();
        const [
          company,
          applications,
        ] = await Promise.all([
          this.getCompanyFromVat({ vat }),
          this.getCompanyApplications({ vat }),
        ]);

        this.$set(this.company, "data", company);

        this.$set(this.company, "applications", applications);

        if (company) {
          for (const [ key, value ] of Object.entries(company)) {
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
          case "maxLength":
            return `Mora biti najviše ${ args.max } znakova`;
          case "url":
            return "Mora biti URL (npr https://www.kset.org)";
          case "email":
            return "Mora biti email (npr. info@kset.org)";
          case "maxFileSize":
            return `Mora biti manje od ${ bytesToHumanReadable(args.size) }`;
          default:
            return error.slice(0, 1).toUpperCase() + error.slice(1);
        }
      },

      toErrorText(errorData) {
        const {
          label,
          path,
          group,
        } = errorData;

        let $e;
        switch (group) {
          case "main": {
            const [ key ] = path;
            $e = this.$v.company.form[key];

            break;
          }
          case "parts": {
            const [ $key, key ] = path;
            $e = this.$v.companyExtras[$key].form[key];
            break;
          }
        }

        if (!$e) {
          return;
        }

        if (!$e.$error) {
          return "";
        }

        const errors = [];
        for (const { type, ...args } of Object.values($e.$params)) {
          if (!$e[type]) {
            errors.push(this.translateError(type, args));
          }
        }

        return `${ label }: ${ errors.join(", ") }`;
      },

      async closeFormSubmitDialog(redirect = false) {
        if (redirect) {
          await this.$router.push({ name: "Index" });
        }

        this.formSubmit.dialog = false;
      },
    },

    head() {
      const title = this.capitalizedTranslation("prijavaFirmi.header");

      return {
        title,
        meta: [
          ...generateMetadata({
            title,
            description: "Prijavite svoje poduzeće na ovogodišnji Job Fair Meetup!",
          }),
        ],
      };
    },
  };
</script>

<style lang="scss" module>
  .prependStar {

    &::before {
      display: inline;
      content: "*";
    }
  }
</style>
