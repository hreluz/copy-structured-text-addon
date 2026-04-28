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
- **Configurable rules system**
- External JSON rules (no code changes required)
- Unit tested extraction logic

---

## Installation (Local)

1. Open extensions page:

- Chrome: `chrome://extensions`
- Brave: `brave://extensions`

2. Enable **Developer mode**

3. Click **Load unpacked**

4. Select your project folder

---

## Usage

1. Right-click any element
2. Click: Copy structured text
3. Paste → you get the extracted value based on rules

---

## Example

Given:

```html
<div>
  <span>Title 4</span>
  <span data-testid="title-4">
    Some data that needs to be copied
  </span>
</div>
```

Right-click anywhere inside → copies:

```
    Some data that needs to be copied
```

---

## How It Works

The extension uses **rules**:

```json
{
  "containerSelector": "div",
  "textSelector": "[data-testid^=\"title-\"]"
}
```

Meaning:

When you click inside a `div`, extract the child matching `[data-testid^="title-"]`.

---

## Rules System

### 1. Default rules (built-in)

Defined in:

```
defaultRules.js
```

```js
const DEFAULT_RULES = [
  {
    name: "Task title",
    containerSelector: "div",
    textSelector: '[data-testid^="title-"]'
  },
  {
    name: "Normal link text",
    containerSelector: "a",
    textSelector: null
  }
];
```

---

### 2. External rules (optional)

Defined in:

```
copyRules.json
```

Example:

```json
[
  {
    "name": "Custom card",
    "containerSelector": ".card",
    "textSelector": ".card-title"
  }
]
```

---

### Rule Priority

External rules (copyRules.json) override default rules.

---

## Project Structure

```
.
├── manifest.json
├── background.js
├── content.js
├── extractText.js
├── defaultRules.js
├── copyRules.json
├── extractText.test.js
├── package.json
├── README.md
├── .gitignore
```

---

## Development

### Install dependencies

```bash
npm install
```

### Run tests

```bash
npm test
```

---

## Testing

Uses Jest and jsdom.

---

## Technical Notes

- Uses Manifest V3
- Context menu via contextMenus
- Content scripts for DOM extraction
- Clipboard via navigator.clipboard.writeText

---

## Limitations

- Depends on DOM structure
- Some sites may block context menu behavior
- No UI for rule editing

---

## Future Improvements

- UI to create/edit rules
- Element picker
- Highlight extracted elements
- Copy multiple fields

---

## License

MIT
