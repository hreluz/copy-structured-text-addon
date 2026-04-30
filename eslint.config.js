const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  js.configs.recommended,

  {
    ignores: ["node_modules/**", "coverage/**"]
  },

  // Chrome extension browser files
  {
    files: ["src/background.js", "src/content.js", "src/popup/popup.js"],

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
        getElementSelector: "readonly",
        startElementPicker: "readonly"
      }
    },

    rules: {
      "no-unused-vars": "warn",
      "no-console": "off"
    }
  },

  // elementPicker (browser + node because of chrome/document + module.exports)
  {
    files: ["src/shared/elementPicker.js"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        ...globals.browser,
        ...globals.node,
        chrome: "readonly",
        getElementSelector: "readonly",
        showCopyToast: "readonly"
      }
    },

    rules: {
      "no-unused-vars": "warn",
      "no-console": "off"
    }
  },

  // selectorValidation (browser + node because of document + module.exports)
  {
    files: ["src/shared/selectorValidation.js"],

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
      "tests/*.test.js",
      "eslint.config.js",
      "src/shared/defaultRules.js",
      "src/shared/extractText.js",
      "src/shared/ruleMerger.js",
      "src/shared/ruleStorage.js"
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
