module.exports = {
  // add your custom config here
  // https://stylelint.io/user-guide/configuration
  extends: "stylelint-config-standard",
  plugins: [
    "stylelint-scss",
  ],
  rules: {
    "number-leading-zero": "never",
    "rule-empty-line-before": [
      "always",
      {
        except: [ "after-single-line-comment" ],
      },
    ],
    "block-closing-brace-empty-line-before": [
      "never",
      {
        except: [ "after-closing-brace" ],
      },
    ],
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [ "extend", "function", "return", "include", "mixin" ],
      },
    ],
    "selector-pseudo-class-no-unknown": [
      true,
      {
        ignorePseudoClasses: [ "global" ],
      },
    ],
    "color-hex-case": "lower",
    "color-hex-length": "long",
  },
};
