<template>
  <div
    v-if="user"

    :class="$style.userContainer"
  >
    <v-menu
      v-if="user"
      v-model="userOpen"
      :close-on-content-click="false"
      offset-y
      transition="scroll-y-transition"
    >
      <template #activator="{ on }">
        <a
          :class="{
            [$style.navLink]: true,
            [$style.noPadding]: noPadding,
          }"
          v-on="on"
        >
          <span
            :class="$style.navLinkText"
            v-text="labelText"
          />
          <v-icon
            :class="{
              [$style.navLinkIcon]: true,
              [$style.navLinkOpen]: userOpen,
            }"
            class="ml-1"
            dense
          >
            mdi-chevron-down
          </v-icon>
        </a>
      </template>

      <v-card>
        <v-list>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title v-text="user.name" />
              <v-list-item-subtitle v-text="user.email" />
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <v-divider v-if="company" />

        <v-list v-if="company" subheader>
          <v-subheader>
            <translated-text trans-key="nav.user.company.memberOf" />
          </v-subheader>

          <v-list-item>
            <v-list-item-avatar
              v-if="company.thumbnail"
              tile
            >
              <v-img
                :src="company.thumbnail"
                contain
              />
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title class="text-center" v-text="company.name" />
            </v-list-item-content>

            <v-list-item-action>
              <v-list-item-action-text>
                <v-btn :to="{ name: 'PageCompanyResumes' }" color="primary">
                  <translated-text trans-key="nav.user.actions.company.enter" />
                </v-btn>
              </v-list-item-action-text>
            </v-list-item-action>
          </v-list-item>
        </v-list>

        <v-divider v-if="canViewStudentPanel" />

        <v-list v-if="canViewStudentPanel" subheader>
          <v-subheader>
            <translated-text trans-key="nav.user.student.header" />
          </v-subheader>

          <v-list-item>
            <v-btn
              :to="{ name: 'PageStudentIndex' }"
              color="primary"
            >
              <translated-text trans-key="button.studentPanel" />
            </v-btn>
          </v-list-item>
        </v-list>

        <v-divider v-if="isGateGuardian" />

        <v-list v-if="isGateGuardian" subheader>
          <v-subheader>
            <translated-text trans-key="nav.user.gateGuardian.header" />
          </v-subheader>

          <v-list-item>
            <v-btn
              :to="{ name: 'PageGateGuardianScanQrCode' }"
              color="primary"
            >
              <translated-text trans-key="button.gateGuardian" />
            </v-btn>
          </v-list-item>
        </v-list>

        <v-divider v-if="canViewAdminPanel" />

        <v-list v-if="canViewAdminPanel" subheader>
          <v-subheader>
            <translated-text trans-key="nav.user.admin.header" />
          </v-subheader>

          <v-list-item v-if="canEditText">
            <v-list-item-action>
              <v-switch :value="isEditing" color="primary" @change="setEditing($event)" />
            </v-list-item-action>
            <v-list-item-title>
              <translated-text trans-key="nav.user.actions.admin.enableEditing" />
            </v-list-item-title>
          </v-list-item>

          <v-list-item>
            <v-btn
              :to="{ name: 'PageAdminIndex' }"
              color="primary"
            >
              <translated-text trans-key="button.adminPanel" />
            </v-btn>
          </v-list-item>
        </v-list>

        <v-card-actions>
          <v-spacer />

          <v-btn text @click="userOpen = false">
            <translated-text trans-key="actions.cancel" />
          </v-btn>
          <v-btn color="error" text @click="logout()">
            <translated-text trans-key="actions.auth.logout" />
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
  <div v-else :class="$style.hidden" />
</template>

<script>
  import {
    mapActions,
    mapGetters,
    mapMutations,
  } from "vuex";
  import TranslatedText from "~/components/TranslatedText";
  import {
    getSrcSet,
  } from "~/helpers/image";

  /**
   * @readonly
   * @enum{string}
   */
  const labels = {
    name: "name",
    email: "email",
  };

  export default {
    name: "NavUserModule",

    components: {
      TranslatedText,
    },

    props: {
      noPadding: {
        required: false,
        type: Boolean,
        default: true,
      },

      label: {
        required: false,
        type: String,
        default: labels.name,
        validator: (value) =>
          Object
            .values(labels)
            .includes(value)
        ,
      },
    },

    data: () => ({
      userOpen: false,
    }),

    computed: {
      ...mapGetters({
        user: "user/getUser",
        company: "user/getCompany",
        isEditing: "translations/isEditable",
        isStudent: "user/isStudent",
        isModerator: "user/isModerator",
        isAdmin: "user/isAdmin",
        isGateGuardian: "user/isGateGuardian",
      }),

      canViewStudentPanel() {
        return this.isStudent && !this.company;
      },

      canViewAdminPanel() {
        return this.isModerator;
      },

      canEditText() {
        return this.isAdmin;
      },

      labelText() {
        switch (this.label) {
          case labels.name:
            return this.user.name;
          case labels.email:
            return this.user.email;
          default:
            return "Account";
        }
      },
    },

    methods: {
      ...mapActions({
        doLogout: "user/doLogout",
      }),

      ...mapMutations({
        setEditing: "translations/SET_EDITABLE",
      }),

      async logout() {
        this.userOpen = false;

        await this.doLogout();

        await this.$router.push({ name: "Index" });
      },

      getSrcSet,
    },
  };
</script>

<style lang="scss" module>
  @import "../assets/styles/include/all";

  .hidden {
    display: none;
  }

  .userContainer {
    display: inline-flex;
    margin-bottom: 4px;

    .navLink {
      @extend %nav-link;

      .navLinkText {
        align-self: center;
      }

      .navLinkIcon {
        transition-property: transform;
        color: inherit;
      }

      .navLinkOpen {
        transform: rotate(180deg);
      }
    }

    .noPadding {
      margin: 0 !important;
      padding: 0 !important;
      border-bottom: none;
    }
  }
</style>
