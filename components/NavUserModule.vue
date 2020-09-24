<template>
  <div
    :class="{
      [$style.userContainer]: true,
      [$style.hidden]: !user,
    }"
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

          <v-divider v-if="user.companies.length" />

          <v-list-item v-if="user.companies.length">
            <v-list subheader>
              <v-subheader>
                <translated-text trans-key="nav.user.company.memberOf" />
              </v-subheader>

              <v-list-item
                v-for="company in user.companies"
                :key="company.id"
              >
                <v-list-item-avatar
                  v-if="company.logo"
                  :data-srcset="getSrcSet(company.images)"
                >
                  <v-img
                    :lazy-src="company.thumbnail"
                    :src="company.image"
                    fill
                  />
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title v-text="company.name" />
                  <v-list-item-subtitle v-text="company.shortDescription.substr(0, 50) + '...'" />
                </v-list-item-content>

                <v-list-item-action>
                  <v-list-item-action-text>
                    <v-btn color="primary">
                      <translated-text trans-key="nav.user.actions.company.enter" />
                    </v-btn>
                  </v-list-item-action-text>
                </v-list-item-action>
              </v-list-item>
            </v-list>
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
        isEditing: "translations/isEditable",
        isStudent: "user/isStudent",
        isModerator: "user/isModerator",
        isAdmin: "user/isAdmin",
      }),

      canViewStudentPanel() {
        return this.isStudent;
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
    //noinspection CssOverwrittenProperties
    display: inline-flex;
    //noinspection CssOverwrittenProperties
    display: contents;

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
