import Vue from "vue";

export default ({ store }) => {
  const translate = store.getters["translations/translation"];
  const registerKey = (key) => store.commit("translations/ADD_TRANSLATION_KEY", key);

  Vue.directive("translation", (el, binding) => {
    const key = String(binding.value || el.textContent || "").trim();

    if (!key) {
      return;
    }

    const translation = translate(key);

    registerKey(key);

    el.innerHTML = translation || key;
  });
};
