<template>
  <v-app-bar app dark elevate-on-scroll>
    <v-toolbar-title>
      <nuxt-link v-ripple :class="$style.logoLink" :to="{ name: 'Index' }">
        <jobfair-meetup-logo />
      </nuxt-link>
    </v-toolbar-title>

    <v-spacer />

    <div :class="$style.navLinkContainer">
      <nuxt-link
        :is="page.href ? 'v-btn' : 'nuxt-link'"

        v-for="page in pages"
        :key="page.href || JSON.stringify(page.to)"

        v-ripple

        :class="[page.variant || $style.navLink]"

        :href="page.href"
        :rel="page.href ? 'noopener noreferrer' : ''"
        :target="page.href ? '_blank' : ''"
        :to="page.to"

        large
        nuxt
        outlined
      >
        <span :class="$style.navLinkText" v-text="page.name" />
      </nuxt-link>

      <v-menu
        v-if="user"
        v-model="userOpen"
        :close-on-content-click="false"
        offset-y
        transition="scroll-y-transition"
      >
        <template #activator="{ on }">
          <a
            :class="$style.navLink"
            v-on="on"
          >
            <span :class="$style.navLinkText" v-text="user.name" />
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

            <v-divider inset />

            <v-list-item
              v-for="company in user.companies"
              :key="company.id"
            >
              <v-list-item-avatar :data-srcset="getSrcSet(company.logo)">
                <v-img
                  :lazy-src="company.logo.small.url"
                  :src="company.logo.original.url"
                  :srcset="getSrcSet(company.logo)"
                  fill
                />
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title v-text="company.brand_name" />
                <v-list-item-subtitle v-text="company.short_description.substr(0, 50) + '...'" />
              </v-list-item-content>
            </v-list-item>
          </v-list>

          <v-divider />

          <!--          <v-list>-->
          <!--            <v-list-item>-->
          <!--              <v-list-item-action>-->
          <!--                <v-switch v-model="message" color="purple" />-->
          <!--              </v-list-item-action>-->
          <!--              <v-list-item-title>Enable messages</v-list-item-title>-->
          <!--            </v-list-item>-->

          <!--            <v-list-item>-->
          <!--              <v-list-item-action>-->
          <!--                <v-switch v-model="hints" color="purple" />-->
          <!--              </v-list-item-action>-->
          <!--              <v-list-item-title>Enable hints</v-list-item-title>-->
          <!--            </v-list-item>-->
          <!--          </v-list>-->

          <v-card-actions>
            <v-spacer />

            <v-btn text @click="userOpen = false">
              Cancel
            </v-btn>
            <v-btn color="error" text @click="userOpen = logout()">
              Logout
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>
    </div>

    <v-btn :class="$style.navBurgerButton" icon @click.stop="toggleOpen">
      <menu-icon />
    </v-btn>
  </v-app-bar>
</template>

<script>
  import {
    mapActions,
    mapGetters,
    mapMutations,
  } from "vuex";
  import MenuIcon from "~/assets/images/icons/menu.svg";
  import JobfairMeetupLogo from "~/assets/images/logo/jobfair.svg";
  import {
    getSrcSet,
  } from "~/helpers/image";

  export default {
    name: "AppNavBar",

    components: {
      MenuIcon,
      JobfairMeetupLogo,
    },

    data: () => ({
      userOpen: false,
    }),

    computed: {
      ...mapGetters({
        rawPages: "pages/getPages",
        user: "user/getUser",
      }),

      HeaderLinkVariants() {
        return {
          DEFAULT: "",
          BUTTON: this.$style.navLinkButton,
        };
      },

      pages() {
        return (
          this
            .rawPages
            .map((page) => {
              if (!page.href) {
                return page;
              }

              return {
                ...page,
                variant: this.HeaderLinkVariants.BUTTON,
              };
            })
        );
      },
    },

    methods: {
      ...mapMutations({
        toggleOpen: "nav-drawer/TOGGLE_OPEN",
      }),

      ...mapActions({
        doLogout: "user/doLogout",
      }),

      async logout() {
        await this.doLogout();

        await this.$router.push({ name: "Index" });
      },

      getSrcSet,
    },
  };
</script>

<style lang="scss" module>
  @import "../assets/styles/include/all";

  $nav-height: 64px;

  .logoLink {
    display: flex;
    padding: .3em;
    border-radius: 4px;
  }

  .navBurgerButton {
    display: none;

    @include media(sm) {
      display: initial;
    }
  }

  .navLinkContainer {
    display: flex;
    align-self: stretch;

    @include media(sm) {
      display: none;
    }

    .navLink {
      $border-size: 4px;

      font-weight: 600;
      display: flex;
      box-sizing: border-box;
      margin: 0 1.2em;
      padding: 0 .4em;
      transition-timing-function: $transition-timing-function;
      transition-duration: 150ms;
      transition-property: color, border-bottom-color;
      text-decoration: none;
      color: $fer-white;
      border-top: #{$border-size} solid transparent;
      border-bottom: #{$border-size} solid transparent;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      will-change: color, border-bottom-color;

      &:active {
        border-bottom-color: transparentize($fer-yellow, .75);
      }

      &:global(.nuxt-link-active) {
        color: fer-hover($fer-yellow);
        border-bottom-color: fer-hover($fer-yellow);
      }

      &:global(.nuxt-link-exact-active) {
        cursor: default;
      }

      &:hover {
        color: fer-hover($fer-yellow);
      }

      .navLinkText {
        align-self: center;
      }
    }

    .navLinkButton {
      align-self: center;
      margin: 0 1.2em;
    }
  }

  :global(.v-toolbar__content) {
    max-width: $content-max-width;
    margin: 0 auto;
    padding-top: 0;
    padding-bottom: 0;
  }
</style>
