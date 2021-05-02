<template>
  <app-max-width-container :class="$style.container">
    <v-row>
      <v-col cols="12">
        <h1>{{ isNew ? "Novi" : "Uredi" }} panel</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-form
          ref="form"
          v-model="form.valid"
          :disabled="form.loading"
          @submit.prevent="form.valid && formSubmit()"
        >
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="panel.title"

                :rules="inputRules.title"

                label="Naslov"

                outlined

                prepend-inner-icon="mdi-cursor-text"
                required
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="panel.description"

                :rules="inputRules.description"

                auto-grow
                counter

                label="Opis"

                outlined
                prepend-inner-icon="mdi-account-details"
                required
                rows="1"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="6">
              <v-dialog
                ref="dialogDate"
                v-model="dialog.date"
                :return-value.sync="dialog.values.date"
                persistent
                width="290px"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-bind="attrs"
                    :value="inputDateFormatted"
                    label="Datum panela"
                    outlined
                    prepend-inner-icon="mdi-calendar"
                    readonly
                    v-on="on"
                  />
                </template>
                <v-date-picker
                  v-model="dialog.values.date"
                  first-day-of-week="1"
                  scrollable
                >
                  <v-spacer />
                  <v-btn
                    color="primary"
                    text
                    @click="dialog.date = false"
                  >
                    Cancel
                  </v-btn>
                  <v-btn
                    color="primary"
                    text
                    @click="$refs.dialogDate.save(dialog.values.date)"
                  >
                    OK
                  </v-btn>
                </v-date-picker>
              </v-dialog>
            </v-col>

            <v-col cols="6">
              <v-dialog
                ref="dialog"
                v-model="dialog.time"
                :return-value.sync="dialog.values.time"
                persistent
                width="290px"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="dialog.values.time"

                    v-bind="attrs"

                    :rules="inputRules.time"
                    label="Vrijeme panela"
                    outlined
                    prepend-inner-icon="mdi-clock-time-four-outline"
                    readonly

                    required

                    v-on="on"
                  />
                </template>
                <v-time-picker
                  v-if="dialog.time"

                  v-model="dialog.values.time"

                  format="24hr"
                  full-width
                  scrollable
                >
                  <v-spacer />
                  <v-btn
                    color="primary"
                    text
                    @click="dialog.time = false"
                  >
                    Cancel
                  </v-btn>
                  <v-btn
                    color="primary"
                    text
                    @click="$refs.dialog.save(dialog.values.time)"
                  >
                    OK
                  </v-btn>
                </v-time-picker>
              </v-dialog>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-autocomplete
                v-model="autocomplete.values"
                :filter="autocompleteFilter"
                :items="autocompleteCompanies"
                :rules="inputRules.companies"

                :search-input.sync="autocomplete.text"
                chips
                deletable-chips
                hide-selected
                item-text="name"
                item-value="id"
                label="Firme koje sudjeluju"
                multiple
                outlined
                prepend-inner-icon="mdi-account-group"

                required

                @change="companiesChanged"
              >
                <template v-slot:selection="data">
                  <v-chip
                    v-bind="data.attrs"
                    :input-value="data.selected"

                    close
                    label
                    x-large

                    @click:close="autocompleteRemoveItem(data.item)"
                  >
                    <v-avatar
                      left
                      tile
                    >
                      <v-img
                        :lazy-src="data.item.thumbnail"
                        :src="data.item.image"
                        contain
                      />
                    </v-avatar>
                    {{ data.item.name }}
                  </v-chip>
                </template>

                <template v-slot:item="data">
                  <template v-if="typeof data.item !== 'object'">
                    <v-list-item-content v-text="data.item" />
                  </template>
                  <template v-else>
                    <v-list-item-avatar>
                      <v-img
                        :lazy-src="data.item.thumbnail"
                        :src="data.item.image"
                        contain
                      />
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title v-text="data.item.name" />
                    </v-list-item-content>
                  </template>
                </template>
              </v-autocomplete>
            </v-col>
          </v-row>

          <v-slide-y-transition
            group
          >
            <v-row
              v-for="entry in panel.companies"
              :key="entry.companyId"
            >
              <v-col v-for="company in [ companyList[entry.companyId] ]" :key="company.id + '-inner'" cols="12">
                <v-row>
                  <v-col
                    class="mb-n10 mb-sm-0 d-flex align-center"
                    cols="6"
                    offset="3"
                    offset-sm="0"
                    sm="2"
                  >
                    <v-card
                      flat
                    >
                      <v-img
                        :lazy-src="company.thumbnail"
                        :src="company.image"
                        contain
                        width="100%"
                      />

                      <v-card-subtitle
                        class="text-center"
                        v-text="company.name"
                      />
                    </v-card>
                  </v-col>

                  <v-col
                    class="d-flex align-center"

                    cols="12"
                    sm="10"
                  >
                    <v-row>
                      <v-col cols="11">
                        <v-textarea
                          v-model="entry.aboutPanelist"

                          :label="`O panelistu za ${ company.name }`"

                          :rules="inputRules.aboutPanelist"
                          auto-grow

                          counter
                          outlined
                          prepend-inner-icon="mdi-account-details"
                          rows="1"
                        />

                        <div
                          v-if="entry.imageId"
                          class="d-flex align-center"
                        >
                          <v-btn
                            color="red"
                            icon
                            @click="entry.imageId = null"
                          >
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>

                          <v-img
                            v-for="{ main, thumb } in [ panelistImage(entry.images) ]"
                            :key="`${main}-${thumb}`"
                            :lazy-src="thumb"
                            :src="main"
                            aspect-ratio="1"
                            contain
                            height="80"
                          />
                        </div>
                        <v-file-input
                          v-else
                          v-model="entry.imageFile"

                          :accept="acceptedImageTypes.join(', ')"
                          label="Slika panelista"
                          show-size
                          truncate-length="50"
                        />
                      </v-col>
                      <v-col cols="1">
                        <div :class="$style.textareaButtons" class="d-flex">
                          <v-btn
                            color="red"
                            icon
                            @click="autocompleteRemoveItem(company)"
                          >
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                        </div>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-slide-y-transition>

          <v-divider />

          <v-row>
            <v-col cols="12">
              <div class="d-flex">
                <v-btn
                  :loading="form.loading"
                  :to="{ name: 'PageAdminPanelsIndex' }"
                  color="warning"
                  x-large
                >
                  Close
                </v-btn>

                <v-spacer />

                <v-btn
                  :disabled="!form.valid"
                  :loading="form.loading"
                  class="ml-10"
                  color="success"
                  x-large
                  @click="formSubmit"
                >
                  {{ isNew ? "Napravi" : "Uredi" }}
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<script>
  import fuzzySearch from "fuzzysearch";
  import isNil from "lodash/fp/isNil";
  import {
    mapActions,
  } from "vuex";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";
  import {
    dotGet,
  } from "~/helpers/data";
  import {
    ALLOWED_MIME_TYPES,
  } from "~/helpers/image";

  /**
   * @param setA
   * @param setB
   * @return {Set<T>}
   */
  function difference(setA, setB) {
    if (!(setA instanceof Set)) {
      setA = new Set(setA);
    }
    if (!(setB instanceof Set)) {
      setB = new Set(setB);
    }

    const _difference = new Set(setA);
    for (const elem of setB) {
      _difference.delete(elem);
    }

    return _difference;
  }

  const rules = {
    required:
      (errorText = "Required") =>
        (value) =>
          (
            Boolean(value) ||
            errorText
          ),

    minLength:
      (length, errorText = "Required") =>
        (value) =>
          (
            length < String(value || "").length ||
            errorText
          )
    ,
  };

  export default {
    components: {
      AppMaxWidthContainer,
    },

    props: {
      companyList: {
        type: Object,
        required: true,
      },


      isNew: {
        type: Boolean,
        default() {
          return false;
        },
      },

      id: {
        type: [ Number, String ],
        default() {
          return "";
        },
      },

      title: {
        type: String,
        default() {
          return "";
        },
      },

      date: {
        type: [ Date, String ],
        default() {
          return "";
        },
      },

      description: {
        type: String,
        default() {
          return "";
        },
      },

      companies: {
        type: Array,
        default() {
          return [];
        },
      },
    },

    data() {
      const { title, date: rawDate, description, companies: rawCompanies } = this;
      const date =
        rawDate
          ? new Date(rawDate)
          : ""
      ;

      const companies = rawCompanies.map((c) => ({ ...c, imageFile: null }));

      const data = {
        panel: {
          title,
          date,
          description,
          companies,
        },

        autocomplete: {
          values: companies.map(({ companyId }) => companyId),
          text: "",
        },

        dialog: {
          date: false,
          time: false,
          values: {
            date: "",
            time: "",
          },
        },

        form: {
          valid: false,
          loading: false,
        },

        searchFields: [
          "legalName",
          "brandName",
          "industry.name",
        ],

        acceptedImageTypes: ALLOWED_MIME_TYPES,
      };

      if (date) {
        const s = (x) => x.toString().padStart(2, "0");

        data.dialog.values.date = `${ s(date.getFullYear()) }-${ s(date.getMonth() + 1) }-${ s(date.getDate()) }`;
        data.dialog.values.time = `${ s(date.getHours()) }:${ s(date.getMinutes()) }`;
      }

      return data;
    },

    computed: {
      autocompleteCompanies() {
        return Object.values(this.companyList);
      },

      selectedCompanies() {
        return this.autocomplete.values.map((companyId) => this.companyList[companyId]);
      },

      inputRules() {
        return {
          title: [
            rules.required("Required"),
            rules.minLength(3, "Min 3 characters"),
          ],

          time: [
            rules.required("Required"),
          ],

          description: [
            rules.required("Required"),
            rules.minLength(10, "Min 10 characters"),
          ],

          companies: [
            rules.required("Required"),
            rules.minLength(1, "Min 1 company"),
          ],

          aboutPanelist: [
            rules.required("Required"),
            rules.minLength(10, "Min 10 characters"),
          ],
        };
      },

      inputDateFormatted() {
        const { date: rawDate } = this.dialog.values;

        if (!rawDate) {
          return "";
        }

        const date = new Date(rawDate);

        return date.toLocaleDateString("hr-HR", {
          weekday: "long",
          year: "numeric",
          month: "numeric",
          day: "numeric",
        });
      },
    },

    watch: {
      "dialog.values": {
        deep: true,
        handler({ date, time }) {
          if (date && time) {
            this.panel.date = new Date(`${ date } ${ time }`);
          }
        },
      },
    },

    created() {
      this.companiesUpdateList(this.autocomplete.values);
    },

    methods: {
      ...mapActions({
        doCreatePanel: "panels/createPanel",
        doUpdatePanel: "panels/updatePanel",
      }),

      companyAdd({ companyId }) {
        const { companies } = this.panel;

        companies.push({
          companyId,
          aboutPanelist: "",
          imageFile: null,
        });
      },

      companyRemove({ companyId }) {
        const { companies } = this.panel;

        const index = companies.findIndex(({ companyId: id }) => companyId === id);

        if (0 <= index) {
          companies.splice(index, 1);
        }
      },

      companiesChanged(companyIds) {
        this.autocomplete.text = "";

        this.companiesUpdateList(companyIds);
      },

      companiesUpdateList(newValues) {
        const lastValues = this.panel.companies.map(({ companyId }) => companyId);
        const addedValues = difference(newValues, lastValues);
        const deletedValues = difference(lastValues, newValues);

        for (const companyId of addedValues) {
          this.companyAdd({ companyId });
        }

        for (const companyId of deletedValues) {
          this.companyRemove({ companyId });
        }
      },

      autocompleteFilter(item, queryText) {
        const search =
          (key) =>
            fuzzySearch(
              queryText.toLowerCase(),
              String(dotGet(item, key) || "").toLowerCase(),
            )
        ;

        return this.searchFields.find(search);
      },

      autocompleteRemoveItem({ id }) {
        const { values: companyIds } = this.autocomplete;

        const index = companyIds.findIndex((companyId) => companyId === id);

        if (0 <= index) {
          companyIds.splice(index, 1);
          this.companiesChanged(companyIds);
        }
      },

      async commitChanges() {
        const { id, isNew, panel } = this;

        const payload = new FormData();

        payload.set("id", id);
        payload.set("title", panel.title);
        payload.set("description", panel.description);
        payload.set("occuresAt", panel.date.toISOString());

        for (const [ i, company ] of Object.entries(panel.companies)) {
          const base = `companies[${ i }]`;
          for (const [ k, v ] of Object.entries(company)) {
            if (isNil(v) || "images" === k) {
              continue;
            }

            payload.set(`${ base }[${ k }]`, v);
          }
        }

        if (isNew || !id) {
          return await this.doCreatePanel({ payload });
        } else {
          return await this.doUpdatePanel({ id, payload });
        }
      },

      async formSubmit() {
        this.form.loading = true;
        const { error, reason, errorData } = await this.commitChanges();
        this.form.loading = false;

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

        await this.$router.push({ name: "PageAdminPanelsIndex" });
      },

      panelistImage(images) {
        const sorted = [ ...images ].sort((a, b) => b.width - a.width);

        return {
          main: sorted[0].url,
          thumb: sorted[sorted.length - 1].url,
        };
      },
    },
  };
</script>

<style lang="scss" module>
  .container {

    .textareaButtons {
      align-items: center;
      justify-content: center;
      height: 100%;
    }
  }
</style>
