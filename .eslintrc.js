module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    "@nuxtjs",
    "plugin:nuxt/recommended",
  ],
  // add your custom rules here
  rules: {
    "nuxt/no-cjs-in-config": "off",
    "space-before-function-paren": [
      "error", "never",
    ],
    "vue/html-indent": [
      "error", 2,
    ],
    "vue/script-indent": [
      "error", 2,
      {
        "baseIndent": 1,
        "switchCase": 1,
      },
    ],
    "indent": "off",
    "@typescript-eslint/indent": "off",
    "array-bracket-spacing": [ "error", "always" ],
    "arrow-parens": [ "error", "always" ],
    "arrow-spacing": "error",
    "camelcase": [
      "error",
      {
        ignoreDestructuring: true,
      },
    ],
    "comma-dangle": [ "error", "always-multiline" ],
    "comma-spacing": [
      "error",
      {
        "before": false,
        "after": true,
      },
    ],
    "comma-style": [ "error", "last" ],
    "computed-property-spacing": [ "error", "never" ],
    "dot-notation": "error",
    "eqeqeq": [ "error", "always" ],
    "guard-for-in": "error",
    "linebreak-style": [ "error", "unix" ],
    "lines-between-class-members": [ "error", "always" ],
    "no-array-constructor": "error",
    "no-bitwise": "error",
    "no-mixed-operators": "error",
    "no-multi-assign": "error",
    "no-multiple-empty-lines": [
      "error",
      {
        "max": 2,
        "maxEOF": 1,
        "maxBOF": 1,
      },
    ],
    "no-console": "warn",
    "no-nested-ternary": "error",
    "no-new-object": "error",
    "no-tabs": "warn",
    "no-new-func": "error",
    "no-new-wrappers": "error",
    "no-return-assign": [ "error", "always" ],
    "no-script-url": "error",
    "no-self-compare": "error",
    "no-sequences": "error",
    "no-useless-constructor": "error",
    "object-shorthand": [ "error", "always" ],
    "prefer-arrow-callback": "warn",
    "prefer-const": "warn",
    "prefer-destructuring": [
      "warn",
      {
        "array": true,
        "object": true,
      },
      {
        "enforceForRenamedProperties": false,
      },
    ],
    "prefer-numeric-literals": "error",
    "prefer-rest-params": "error",
    "prefer-spread": "warn",
    "prefer-template": "warn",
    "quotes": [
      "error",
      "double",
      {
        "avoidEscape": true,
      },
    ],
    "semi": [ "error", "always" ],
    "space-before-blocks": [ "warn", "always" ],
    "space-infix-ops": "error",
    "template-curly-spacing": [ "error", "always" ],
    "template-tag-spacing": [ "error", "never" ],
    "wrap-iife": [ "error", "inside" ],
    "yoda": [ "error", "always", { "exceptRange": true } ],
  },
};
