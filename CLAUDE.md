# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install           # install dev dependencies
npm test              # run all Jest tests
npm run check         # lint + format check (run before committing)
npm run lint          # ESLint check
npm run lint:fix      # ESLint auto-fix
npm run format        # Prettier format all files
npm run format:check  # Prettier check without writing
```

Run a single test file:

```bash
npx jest extractText.test.js
```

## Architecture

This is a **Chrome/Brave Manifest V3 extension** with no build step — plain JS files are loaded directly by the browser and by Jest for testing.

### Script loading and globals

Because the extension loads scripts as plain `<script>` tags (not modules), shared utilities are made available as implicit globals. The **content script** load order (from `manifest.json`) is:

```
defaultRules.js → ruleMerger.js → extractText.js → elementSelector.js → content.js
```

The **popup** load order (from `popup.html` `<script>` tags) is:

```
defaultRules.js → ruleStorage.js → ruleMerger.js → selectorValidation.js → rulesImportExport.js → popup.js
```

Each utility file guards its `module.exports` with `if (typeof module !== "undefined")` so the same file works both in the browser (as a global) and in Node/Jest (as a CommonJS module).

### Rules pipeline

Rules flow through three layers in priority order:

```
chrome.storage.local (customRules)  ← UI-created rules
        ↓
copyRules.json                      ← static file bundled with the extension
        ↓
defaultRules.js (DEFAULT_RULES)     ← built-in fallback
```

`ruleMerger.js:mergeRules()` concatenates the three arrays in that order. `extractText.js:extractTextResult()` walks the merged array and returns the first rule whose `containerSelector` matches an ancestor of the right-clicked element, then optionally narrows to `textSelector` inside that container.

### Message flow

- **background.js** registers the context menu item and forwards `COPY_STRUCTURED_TEXT` to the active tab.
- **content.js** captures the right-clicked target on `contextmenu`, then on `COPY_STRUCTURED_TEXT` writes to the clipboard, persists `lastMatchedRule` to `chrome.storage.local`, and shows a toast.
- **content.js** also handles `START_ELEMENT_PICKER` to activate the visual element picker, which on click writes a `pendingPickedRule` to storage.
- **popup.js** reads `pendingPickedRule` on open and pre-fills the add-rule form; it also listens to `chrome.storage.onChanged` to stay in sync with content script activity.

### Element selector generation

`elementSelector.js:getElementSelector()` produces stable CSS selectors in priority order: `data-testid` (with prefix-match `^=` for dynamic IDs like `title-3`) → `#id` → tag + stable class names (filtering out CSS-in-JS hashes like `sc-*`, BEM modifiers `__`/`--`, and classes with 4+ digit sequences).

### Testing approach

Tests use Jest + jsdom. Utility files are `require()`'d directly because of the `module.exports` guard pattern — no Chrome API mock is needed for them. `content.test.js` and `popup-source.test.js` test structure by reading source files as strings and asserting key patterns exist, avoiding the need to execute browser-context code in Node.
