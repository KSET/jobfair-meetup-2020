<template>
  <app-max-width-container>
    <v-row>
      <v-col cols="12">
        <h1>Settings</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-row
          v-for="setting in settings"
          :key="setting.key"
          class="my-n6"
        >
          <v-col class="mt-7" cols="10">
            <v-text-field
              v-model="setting.value"
              :disabled="setting.loading"
              :error-messages="setting.error"
              :label="setting.key"
              :loading="setting.loading"
              dense
              outlined
            />
          </v-col>
          <v-col class="d-flex align-center justify-left" cols="2">
            <v-btn
              color="success"
              @click="saveSetting(setting)"
            >
              Save
            </v-btn>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="mt-7 d-flex" cols="10">
            <v-text-field
              v-model="newSetting.key"
              :disabled="newSetting.loading"
              :loading="newSetting.loading"
              dense
              label="Key"
              outlined
            />
            <v-text-field
              v-model="newSetting.value"
              :disabled="newSetting.loading"
              :error-messages="newSetting.error"
              :loading="newSetting.loading"
              class="ml-2"
              dense
              label="Value"
              outlined
            />
          </v-col>
          <v-col class="d-flex align-center justify-left" cols="2">
            <v-btn
              :loading="newSetting.loading"
              color="success"
              @click="saveSetting(newSetting)"
            >
              Save
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<router>
name: PageAdminSettingsList
</router>

<script>
  import {
    mapActions,
  } from "vuex";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";

  const addProperty =
    (property, value = null) =>
      (list) =>
        list.map(
          (entry) => ({
            ...entry,
            [property]: value,
          }),
        )
  ;

  const toList =
    (object) =>
      Object
        .entries(object)
        .map(
          ([ key, value ]) =>
            ({
              key,
              value,
            })
          ,
        )
  ;

  export default {
    name: "PageAdminSettingsList",

    components: {
      AppMaxWidthContainer,
    },

    async asyncData({ store }) {
      return {
        settings:
          await store
            .dispatch("settings/fetchSettings")
            .then(toList)
            .then(addProperty("loading", false))
            .then(addProperty("error", ""))
        ,
      };
    },

    data: () => ({
      newSetting: {
        key: "",
        value: "",
        loading: false,
      },
    }),

    methods: {
      ...mapActions({
        doSaveSetting: "settings/updateSetting",
      }),

      async saveSetting(entry) {
        entry.loading = true;
        try {
          const { data, error, errorData } = await this.doSaveSetting(entry);

          if (error) {
            entry.error =
              errorData
                ? errorData.join("\n")
                : "Something went wrong. Please try again."
            ;

            return;
          }

          const oldSettingId = this.settings.findIndex(({ key }) => key === data.key);

          if (-1 === oldSettingId) {
            this.settings.push(data);
          } else {
            this.$set(this.settings, oldSettingId, data);
          }

          this.newSetting.key = "";
          this.newSetting.value = "";
          this.newSetting.error = "";
        } catch (e) {
          console.warn(e);
          entry.error = "Something went wrong. Please try again.";
        } finally {
          entry.loading = false;
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .list-item {
    display: inline-block;
    margin-right: 10px;
  }

  .list-enter-active,
  .list-leave-active {
    transition: all .5s;
  }

  .list-enter,
  .list-leave-to {
    transform: translateY(30px);
    opacity: 0;
  }
</style>
