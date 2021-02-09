<template>
  <v-row :class="$style.container">
    <v-col cols="12">
      <table :class="[$style.section, $style.sectionTable]">
        <tbody>
          <tr
            v-for="(value, key) in basicInfo"
            :key="`basicInfo:${key}`"
          >
            <td>
              <translated-text
                :class="$style.sectionKey"
                :trans-key="`company.adminPanel.resumes.basicInfo.${key}`"
              />
            </td>

            <td>
              <basic-info-value
                :class="$style.sectionValue"
                :entry="value"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <v-row :class="[$style.section, $style.sectionStaggered]">
        <v-col
          v-for="(value, key) in basicInfo"
          :key="`basicInfo:${key}`"
          cols="12"
        >
          <div>
            <translated-text
              :class="$style.sectionKey"
              :trans-key="`company.adminPanel.resumes.basicInfo.${key}`"
            />
          </div>

          <div>
            <basic-info-value
              :class="$style.sectionValue"
              :entry="value"
            />
          </div>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>


<script>
  import BasicInfoValue from "~/components/student/resume/basic-info-value";
  import TranslatedText from "~/components/TranslatedText";

  export default {
    name: "BasicInfoTable",

    components: {
      BasicInfoValue,
      TranslatedText,
    },

    props: {
      basicInfo: {
        type: Object,
        required: true,
      },
    },
  };
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  .container {

    .section {

      &.sectionTable {
        display: table;
        margin: -1.5em 0;
        border-spacing: 0 1.5em;
        border-collapse: separate;

        @include media(sm) {
          display: none;
        }
      }

      &.sectionStaggered {
        display: none;

        @include media(sm) {
          display: block;
        }
      }

      .sectionKey,
      .sectionValue {
        font-weight: 600;
        color: $fer-black;
      }

      .sectionKey {
        margin-right: 4em;
        text-transform: uppercase;
        opacity: .6;
      }

      .sectionValue {
        opacity: .8;
      }
    }
  }
</style>
