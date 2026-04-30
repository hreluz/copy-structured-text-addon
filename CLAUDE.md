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
npx jest tests/shared/extractText.test.js
```

## Architecture

This is a **Chrome/Brave Manifest V3 extension** with no build step — plain JS files are loaded directly by the browser and by Jest for testing.

### Script loading and globals

Because the extension loads scripts as plain `<script>` tags (not modules), shared utilities are made available as implicit globals. The **content script** load order (from `manifest.json`) is:

```
defaultRules.js → ruleMerger.js → extractText.js → elementSelector.js
    → toast.js → elementPicker.js → rulesLoader.js → contentListeners.js
```

The **popup** load order (from `popup.html` `<script>` tags) is:

```
../shared/defaultRules.js → ../shared/ruleStorage.js → ../shared/ruleMerger.js
    → ../shared/selectorValidation.js → ../shared/rulesImportExport.js → popup.js
```

Files that are used in both browser and Node/Jest guard their exports with `if (typeof module !== "undefined")`. Files that only auto-execute in the browser (`rulesLoader.js`, `contentListeners.js`) have no `module.exports` at all.

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
- **rulesLoader.js** loads rules from `chrome.storage.local`, `copyRules.json`, and `DEFAULT_RULES` on init and reloads whenever `customRules` changes in storage.
- **contentListeners.js** captures the right-clicked target on `contextmenu`, then on `COPY_STRUCTURED_TEXT` writes to the clipboard, persists `lastMatchedRule` to storage, and shows a toast. Also handles `START_ELEMENT_PICKER`.
- **elementPicker.js** activates a visual hover-and-click picker; on click writes a `pendingPickedRule` to storage and calls `showCopyToast`.
- **toast.js** provides `showCopyToast`, used by both `contentListeners.js` and `elementPicker.js`.
- **popup.js** reads `pendingPickedRule` on open and pre-fills the add-rule form; listens to `chrome.storage.onChanged` to stay in sync with content script activity.

### Element selector generation

`elementSelector.js:getElementSelector()` produces stable CSS selectors in priority order: `data-testid` (with prefix-match `^=` for dynamic IDs like `title-3`) → `#id` → tag + stable class names (filtering out CSS-in-JS hashes like `sc-*`, BEM modifiers `__`/`--`, and classes with 4+ digit sequences).

### Testing approach

Tests live in `tests/shared/` and `tests/popup/`, mirroring the `src/` structure. Two patterns are used:

- **Unit tests** (`extractText`, `elementSelector`, `ruleMerger`, `ruleStorage`, `rulesImportExport`, `selectorValidation`, `toast`) — `require()` the module directly and test behaviour with jsdom where needed. No Chrome API mock required.
- **Source-string tests** (`elementPicker`, `rulesLoader`, `contentListeners`, `popup-source`) — read the source file as a string and assert key patterns exist. Used for browser-only files that auto-execute and depend on the Chrome runtime.
