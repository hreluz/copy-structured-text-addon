# Copy Structured Text (Chrome / Brave Extension)

A browser extension that lets you **right-click any element and copy structured text** based on configurable rules.

Instead of copying raw text, you define **what part of the DOM should be extracted**.

---

## Features

- Right-click anywhere → extract structured text
- Works on **Chrome** and **Brave**
- Supports:
  - Link text (`<a>`)
  - Complex DOM structures
- **UI to manage rules directly from the browser**
  - Create rules
  - Edit rules
  - Delete rules
- **Import / Export rules (JSON)**
- **Shows which rule matched after copy (toast)**
- **Displays last matched rule in popup**
- Supports BOTH:
  - UI rules (stored locally)
  - External JSON rules (`copyRules.json`)
- Priority system (UI > JSON > Default)
- Unit tested extraction logic

---

## Installation (Local)

1. Open:
- Chrome: `chrome://extensions`
- Brave: `brave://extensions`

2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select your project folder

---

## Usage

### Copy text

1. Right-click any element
2. Click: `Copy structured text`
3. Paste → extracted value

---

### Manage rules (UI)

1. Click the extension icon

2. Create a rule:
   - Fill:
     - Name
     - Container Selector
     - Text Selector (optional)
   - Click **Add Rule**

3. Edit a rule:
   - Click **Edit**
   - Modify the fields
   - Click **Update Rule**

4. Delete a rule:
   - Click **Delete**

5. Cancel editing:
   - Click **Cancel Edit**

---

### UI Behavior

- New rules are added at the top
- Edited rules keep their position
- Deleting removes immediately
- Changes persist using `chrome.storage.local`

---

## Import / Export Rules

### Export
- Click **Export Rules**
- Downloads a JSON file with your custom rules

### Import
- Click **Import Rules**
- Select a JSON file
- Rules are validated before saving

### Example JSON

```json
[
  {
    "name": "Header",
    "containerSelector": "body",
    "textSelector": "#headerleft"
  }
]
```

### Notes

- Import replaces existing UI rules
- Does NOT modify:
  - `copyRules.json`
  - `defaultRules.js`

---

## Rule Priority

```
UI rules (popup / chrome.storage)
        ↓
copyRules.json (external file)
        ↓
defaultRules.js (built-in fallback)
```

---

## Rules System

### Rule structure

```json
{
  "name": "Task title",
  "containerSelector": "div",
  "textSelector": "[data-testid^=\"title-\"]"
}
```

---

## Project Structure

```
.
├── manifest.json
├── package.json
├── src/
│   ├── background.js
│   ├── content.js
│   ├── copyRules.json
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.js
│   │   └── popup.css
│   └── shared/
│       ├── defaultRules.js
│       ├── elementSelector.js
│       ├── extractText.js
│       ├── ruleMerger.js
│       ├── ruleStorage.js
│       ├── rulesImportExport.js
│       └── selectorValidation.js
└── tests/
    └── *.test.js
```

---

## Development

```bash
npm install
npm test
```

---

## License

MIT
