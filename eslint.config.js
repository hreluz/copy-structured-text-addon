const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  js.configs.recommended,

  {
    ignores: ["node_modules/**", "coverage/**"]
  },

  // Chrome extension browser files
  {
    files: ["src/background.js", "src/popup/popup.js"],

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

  // toast.js (browser + node because of document + module.exports)
  {
    files: ["src/shared/toast.js"],

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

  // elementPicker.js (browser + node, consumes showCopyToast + getElementSelector as globals)
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

  // rulesLoader.js (browser only, consumes mergeRules + DEFAULT_RULES as globals)
  {
    files: ["src/shared/rulesLoader.js"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        ...globals.browser,
        chrome: "readonly",
        DEFAULT_RULES: "readonly",
        mergeRules: "readonly"
      }
    },

    rules: {
      "no-unused-vars": "warn",
      "no-console": "off"
    }
  },

  // contentListeners.js (browser only, consumes rules + showCopyToast + others as globals)
  {
    files: ["src/shared/contentListeners.js"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        ...globals.browser,
        chrome: "readonly",
        extractTextResult: "readonly",
        startElementPicker: "readonly",
        showCopyToast: "readonly",
        rules: "readonly"
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
