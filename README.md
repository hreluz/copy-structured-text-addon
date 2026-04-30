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
- **Visual element picker (click to generate selector)**  
- **Edit picked selector before saving**  
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

## Manage rules (UI)

1. Click the extension icon  

2. Create a rule:
   - Name  
   - Container Selector  
   - Text Selector (optional)  
   - Click **Add Rule**  

3. Edit a rule:
   - Click **Edit**  
   - Modify fields  
   - Click **Update Rule**  

4. Delete a rule:
   - Click **Delete**  

5. Cancel:
   - **Cancel Edit** → when editing  
   - **Discard Pick** → when using picker  

---

### UI Behavior

- New rules are added at the top  
- Edited rules keep their position  
- Deleting removes immediately  
- Changes persist using `chrome.storage.local`  

---

## Visual Element Picker

Quickly create rules without writing selectors manually.

### How it works

1. Open the extension popup  
2. Click **Pick Element**  
3. Hover elements (they highlight)  
4. Click the element  
5. Re-open popup  
6. Form is pre-filled  
7. **Edit selector if needed**  
8. Click **Add Picked Rule**  

---

### Tips

- Press **Esc** to cancel  
- Use **Discard Pick** to reset  
- Prefer stable selectors:
  - `id`
  - `data-testid`
  - meaningful classes  
- Always review before saving  

---

## Import / Export Rules

### Export

- Click **Export Rules**  
- Downloads JSON file  

### Import

- Click **Import Rules**  
- Select JSON file  
- Rules are validated  

---

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

---

### Notes

- Import **replaces UI rules**
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

### Behavior

1. Find closest `containerSelector`  
2. Inside it:
   - If `textSelector` exists → extract it  
   - Else → use container text  

---

## Rule Feedback

After copying:

- Toast appears:

```
Copied using rule: Auth Title
```

- Popup shows:
  - Rule used  
  - Text  
  - Timestamp  

---

## Debugging

### Check last matched rule

Open popup:

```
Last Match
```

---

### Common issues

- No match → selectors wrong  
- Wrong text → rule priority  
- No copy → content script not loaded  

---

## External Rules (Optional)

Define shared rules in:

```
copyRules.json
```

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
├── ruleMerger.js
├── ruleStorage.js
├── selectorValidation.js
├── rulesImportExport.js
├── package.json
├── README.md
├── .gitignore
```

---

## Development

```bash
npm install
npm test
```

---

## Testing

Uses:

- Jest  
- jsdom  

Covers:

- Rule extraction  
- Rule validation  
- Rule merging  
- Import / Export  
- Popup structure  

---

## Technical Notes

- Manifest V3  
- `contextMenus` for right-click  
- `chrome.storage.local` for rules  
- Clipboard via `navigator.clipboard.writeText`  

---

## Limitations

- Depends on selectors  
- Some sites block right-click  
- No picker history (yet)  

---

## License

MIT
