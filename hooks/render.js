import {
  queryTranslationsInsertOne,
} from "../db/helpers/translations";
import {
  query,
} from "../db/methods";

export default (nuxtConfig) => ({

  async routeDone(_url, _result, { nuxt }) {
    const { undefinedKeys = [] } = nuxt.state.translations;

    await Promise.all(
      [
        ...undefinedKeys,
      ]
        .map(
          (key) =>
            query(
              queryTranslationsInsertOne({ key, value: key }),
            )
              .catch((e) => console.log("|> INSERT ERROR", e))
          ,
        )
      ,
    );

    if (undefinedKeys.length) {
      console.log("|> New translation keys", undefinedKeys);
    }
  },

});
