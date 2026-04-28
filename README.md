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
- **UI to create rules directly from the browser**
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

### Create rules (UI)

1. Click the extension icon
2. Fill:

- Name
- Container Selector
- Text Selector (optional)

3. Click **Add Rule**

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

### Behavior

1. Find closest `containerSelector`
2. Inside it:
   - If `textSelector` exists → extract that element
   - Else → use container text

---

## UI Examples

### Example 1 — Task Title

```txt
Name: Task Title
Container Selector: div
Text Selector: [data-testid^="title-"]
```

---

### Example 2 — Copy `<h1>` title

```html
<h1 class="auth-title xqwe-mb-24">Dashboard</h1>
```

```txt
Name: Auth Title
Container Selector: .auth-title
Text Selector: (empty)
```

---

### Example 3 — Strict selector

```txt
Name: Auth Title Strict
Container Selector: h1.auth-title.xqwe-mb-24
Text Selector: (empty)
```

---

### Example 4 — Global extraction

```txt
Name: Global Header
Container Selector: body
Text Selector: .auth-title
```

---

### Example 5 — Copy link text

```txt
Name: Link text
Container Selector: a
Text Selector: (empty)
```

---

## External Rules (Optional)

You can define rules in a JSON file:

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
  },
  {
    "name": "Header Left",
    "containerSelector": "#headerleft",
    "textSelector": null
  }
]
```

### Use cases

- Shared team rules
- Version-controlled configurations
- Predefined setups

---

## Selectors Guide

| Type        | Example        | Meaning              |
|------------|--------------|----------------------|
| ID         | `#headerleft` | Select by ID         |
| Class      | `.card`       | Select by class      |
| Tag        | `h1`          | Select by tag        |
| Attribute  | `[data-id=1]` | Select by attribute  |
| Starts with| `[data^=x]`   | Attribute starts with|

---

## Default Rules

Defined in:

```
defaultRules.js
```

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
├── popup.html
├── popup.js
├── popup.css
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

Uses:

- Jest
- jsdom

Covers:

- Default rules
- UI rules
- JSON rules
- Rule priority
- Selector behavior

---

## Technical Notes

- Manifest V3
- `contextMenus` for right-click
- `chrome.storage.local` for UI rules
- Clipboard via `navigator.clipboard.writeText`

---

## Limitations

- Depends on correct selectors
- Some sites override right-click behavior
- No visual selector picker yet

---

## License

MIT
