const fs = require("fs");
const path = require("path");

describe("elementPicker.js structure", () => {
  let source;

  beforeAll(() => {
    source = fs.readFileSync(path.resolve(__dirname, "../../src/shared/elementPicker.js"), "utf-8");
  });

  test("defines picker state", () => {
    expect(source).toContain("let pickerActive = false");
    expect(source).toContain("let highlightedElement = null");
  });

  test("defines all picker functions", () => {
    expect(source).toMatch(/function\s+startElementPicker\s*\(/);
    expect(source).toMatch(/function\s+stopElementPicker\s*\(/);
    expect(source).toMatch(/function\s+highlightElement\s*\(/);
    expect(source).toMatch(/function\s+handlePickerMouseOver\s*\(/);
    expect(source).toMatch(/function\s+handlePickerClick\s*\(/);
    expect(source).toMatch(/function\s+handlePickerKeyDown\s*\(/);
  });

  test("stores picked rule in chrome storage", () => {
    expect(source).toContain("pendingPickedRule");
    expect(source).toContain("containerSelector: selector");
    expect(source).toContain("textSelector: null");
  });

  test("supports escape key to cancel picker", () => {
    expect(source).toContain('event.key === "Escape"');
    expect(source).toContain("Element picker cancelled");
  });

  test("highlights element with blue outline", () => {
    expect(source).toContain("2px solid #00aaff");
  });

  test("clears outline on stop", () => {
    expect(source).toContain('highlightedElement.style.outline = ""');
  });

  test("exports startElementPicker, stopElementPicker, highlightElement", () => {
    expect(source).toContain("startElementPicker");
    expect(source).toContain("stopElementPicker");
    expect(source).toContain("highlightElement");
    expect(source).toContain("module.exports");
  });

  test("does not export module in browser context", () => {
    expect(source).toContain('typeof module !== "undefined"');
  });
});
