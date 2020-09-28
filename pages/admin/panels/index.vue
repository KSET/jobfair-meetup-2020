<template>
  <app-max-width-container>
    <v-row>
      <v-col>
        <h1>Panels</h1>
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
      <v-col>
        <v-btn
          :to="{ name: 'PageAdminPanelsNew' }"
          color="success"
        >
          Novi panel
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="panel in panels"
        :key="panel.id"

        cols="6"
        md="3"
        sm="4"
      >
        <company-participant
          :event="panel"
          no-link
        >
          <v-divider class="mb-2 mt-n1" />

          <v-card-actions>
            <v-btn
              :loading="panel.loading"
              color="error"
              icon

              @click.prevent="deletePanel(panel)"
            >
              <v-icon>
                mdi-delete
              </v-icon>
            </v-btn>

            <v-spacer />

            <v-btn
              :loading="panel.loading"

              :to="{ name: 'PageAdminPanelsEdit', params: { id: panel.id } }"
              color="warning"
              icon
            >
              <v-icon>
                mdi-pencil
              </v-icon>
            </v-btn>
          </v-card-actions>
        </company-participant>
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<script>
  import {
    mapActions,
  } from "vuex";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";
  import CompanyParticipant from "~/components/companies/CompanyParticipant";

  const fetchList = async (store) => {
    const rawPanels = await store.dispatch("panels/fetchListWithInfo");
    return rawPanels.map((panel) => ({ ...panel, loading: false }));
  };

  export default {
    name: "PageAdminPanelsIndex",

    components: {
      CompanyParticipant,
      AppMaxWidthContainer,
    },

    async asyncData({ store }) {
      return {
        panels: await fetchList(store),
      };
    },

    methods: {
      ...mapActions({
        doDeletePanel: "panels/deletePanel",
        doFetchListWithInfo: "panels/fetchListWithInfo",
      }),

      async deletePanel(panel) {
        if (!confirm(`Are you sure you want to delete "${ panel.title }"`)) {
          return;
        }

        panel.loading = true;

        const { error, reason, errorData } = await this.doDeletePanel(panel);

        if (error) {
          panel.loading = false;

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

        this.$set(this, "panels", await fetchList(this.$store));

        panel.loading = false;
      },
    },
  };
</script>
