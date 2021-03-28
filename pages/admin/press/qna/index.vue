<template>
  <app-max-width-container>
    <v-row>
      <v-col>
        <h1>Q'n'A</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-btn
          :to="{ name: 'PageAdminPressIndex' }"
        >
          <v-icon left>
            mdi-arrow-left
          </v-icon>
          Back
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-form
        v-model="form.valid"
        :disabled="form.loading"
        style="width: 100%;"
      >
        <v-select
          v-model="form.inputs.topic"
          :items="topics"
          :rules="[v => !!v || 'Item is required']"
          label="Topic"
          required
        />

        <v-text-field
          v-model="form.inputs.question"
          :rules="[v => !!v || 'Item is required']"
          label="Question"
          required
        />

        <v-textarea
          v-model="form.inputs.answer"
          :rules="[v => !!v || 'Item is required']"
          label="Answer"
          required
        />

        <v-row>
          <v-col class="d-flex">
            <v-spacer />

            <v-btn
              :disabled="!form.valid"
              :loading="form.loading"
              color="success"
              @click.prevent="submitForm"
            >
              Submit
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-row
          v-for="(questions, topic) in items"
          :key="topic"
        >
          <v-col cols="12">
            <h1>
              <translated-text
                :trans-key="`qna.companyApplications.${topic}.header`"
              />
            </h1>
          </v-col>
          <v-col cols="12">
            <transition-group name="flip-list-transition">
              <v-row
                v-for="({id, question, answer}, i) in questions"
                :key="id"
                class="flip-list-transition-item"
              >
                <v-col cols="12">
                  <h3 class="d-inline-block" v-text="question" />

                  <div class="float-right">
                    <v-btn
                      :disabled="form.loading || i === 0"
                      color="warning"
                      icon
                      @click="handleChangeItemOrder(id, 1)"
                    >
                      <v-icon>mdi-arrow-up</v-icon>
                    </v-btn>

                    <v-btn
                      :disabled="form.loading || i === questions.length - 1"
                      color="warning"
                      icon
                      @click="handleChangeItemOrder(id, -1)"
                    >
                      <v-icon>mdi-arrow-down</v-icon>
                    </v-btn>

                    <v-btn
                      :disabled="form.loading"
                      color="error"
                      icon
                      @click="handleDeleteItem(id)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </v-col>
                <v-col cols="12" v-text="answer" />
              </v-row>
            </transition-group>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<router>
name: PageAdminQnAIndex
</router>

<script>
  import {
    mapActions,
    mapGetters,
  } from "vuex";
  import TranslatedText from "~/components/TranslatedText";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";
  import {
    TOPICS_BY_NAME,
  } from "~/helpers/qna";

  const [ firstTopic ] =
    Object
      .values(TOPICS_BY_NAME.companyApplications)
  ;

  const emptyForm = () => ({
    valid: false,
    loading: false,
    inputs: {
      topic: firstTopic,
      question: "",
      answer: "",
    },
  });

  export default {
    components: {
      TranslatedText,
      AppMaxWidthContainer,
    },

    async fetch({ store }) {
      await store.dispatch("qna/fetchAllCompanyApplicationItems");
    },

    data: () => ({
      form: emptyForm(),
    }),

    computed: {
      ...mapGetters({
        getTranslation: "translations/translation",
        items: "qna/getItems",
      }),

      topics() {
        return (
          Object
            .entries(TOPICS_BY_NAME.companyApplications)
            .map(([ name, id ]) => ({
              text: this.getTranslation(`qna.companyApplications.${ name }.header`),
              value: id,
            }))
        );
      },
    },

    methods: {
      ...mapActions({
        addItem: "qna/addItem",
        deleteItem: "qna/deleteItem",
        changeItemOrder: "qna/changeItemOrder",
        fetchItems: "qna/fetchAllCompanyApplicationItems",
      }),

      async handleDeleteItem(id) {
        if (!window.confirm("Are you sure you want to delete the answer?")) {
          return;
        }

        this.form.loading = true;

        try {
          const {
            error,
            reason,
            errorData,
          } = await this.deleteItem({
            id,
          });

          if (error) {
            const err =
              reason ||
              (
                errorData
                  ? errorData.join("\n")
                  : "Something went wrong"
              )
            ;

            throw new Error(err);
          }

          await this.fetchItems();
        } catch (e) {
          alert(e.message);
        } finally {
          this.form.loading = false;
        }
      },

      async handleChangeItemOrder(id, by = 1) {
        this.form.loading = true;

        try {
          const {
            error,
            reason,
            errorData,
          } = await this.changeItemOrder({
            id,
            by,
          });

          if (error) {
            const err =
              reason ||
              (
                errorData
                  ? errorData.join("\n")
                  : "Something went wrong"
              )
            ;

            throw new Error(err);
          }

          await this.fetchItems();
        } catch (e) {
          alert(e.message);
        } finally {
          this.form.loading = false;
        }
      },

      async submitForm() {
        this.form.loading = true;

        try {
          const { inputs } = this.form;

          const {
            error,
            reason,
            errorData,
          } = await this.addItem({
            question: inputs.question,
            answer: inputs.answer,
            categoryId: inputs.topic,
          });

          if (error) {
            const err =
              reason ||
              (
                errorData
                  ? errorData.join("\n")
                  : "Something went wrong"
              )
            ;

            throw new Error(err);
          }

          this.$set(this, "form", emptyForm());

          await this.fetchItems();
        } catch (e) {
          alert(e.message);
        } finally {
          this.form.loading = false;
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  @import "assets/styles/include/all";

  .flip-list-transition {

    &-item {
      transition-timing-function: $transition-bounce-function;
      transition-duration: .8s;
      transition-property: transform, opacity;
      will-change: transform, opacity;
    }

    &-move {
      transition-duration: .3s;
    }

    &-enter-from,
    &-leave-to {
      transform: translateX(30px);
      opacity: 0;
    }

    &-leave-active {
      position: absolute;
    }
  }
</style>
