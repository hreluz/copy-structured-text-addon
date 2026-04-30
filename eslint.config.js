const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  js.configs.recommended,

  {
    ignores: ["node_modules/**", "coverage/**"]
  },

  // Chrome extension browser files
  {
    files: ["background.js", "content.js", "popup.js"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        ...globals.browser,
        chrome: "readonly",

        DEFAULT_RULES: "readonly",
        mergeRules: "readonly",
        extractTextResult: "readonly",
        validateRule: "readonly",
        updateRule: "readonly",
        addRule: "readonly",
        deleteRule: "readonly",
        getElementSelector: "readonly"
      }
    },

    rules: {
      "no-unused-vars": "warn",
      "no-console": "off"
    }
  },

  // selectorValidation (browser + node because of document + module.exports)
  {
    files: ["selectorValidation.js"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },

    rules: {
      "no-unused-vars": "warn",
      "no-console": "off"
    }
  },

  // Node/CommonJS files and tests
  {
    files: [
      "*.test.js",
      "eslint.config.js",
      "defaultRules.js",
      "extractText.js",
      "ruleMerger.js",
      "ruleStorage.js"
    ],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.jest
      }
    },

    rules: {
      "no-unused-vars": "warn",
      "no-console": "off"
    }
  }
];
