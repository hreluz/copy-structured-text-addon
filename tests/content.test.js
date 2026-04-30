const fs = require("fs");
const path = require("path");

describe("content.js structure", () => {
  let content;

  beforeAll(() => {
    content = fs.readFileSync(path.resolve(__dirname, "../src/content.js"), "utf-8");
  });

  test("defines rules state", () => {
    expect(content).toContain("let rules = []");
  });

  test("defines last right clicked result state", () => {
    expect(content).toContain("let lastRightClickedResult");
  });

  test("loads merged rules", () => {
    expect(content).toContain("mergeRules(customRules, fileRules, DEFAULT_RULES)");
  });

  test("uses extractTextResult from extractText.js", () => {
    expect(content).toContain("extractTextResult(event.target, rules)");
  });

  test("does not redefine extractTextResult inside content.js", () => {
    expect(content).not.toMatch(/function\s+extractTextResult\s*\(/);
  });

  test("does not export module from content.js", () => {
    expect(content).not.toContain("module.exports");
  });

  test("defines showCopyToast helper", () => {
    expect(content).toMatch(/function\s+showCopyToast\s*\(/);
  });

  test("shows matched rule after successful copy", () => {
    expect(content).toContain("showCopyToast(`Copied using rule: ${ruleName}`)");
  });

  test("stores matched rule name before showing toast", () => {
    expect(content).toContain(
      'const ruleName = lastRightClickedResult.rule?.name || "Unknown rule"'
    );
    expect(content).toContain("ruleName,");
  });

  test("defines element picker state", () => {
    expect(content).toContain("let pickerActive = false");
    expect(content).toContain("let highlightedElement = null");
  });

  test("defines element picker helpers", () => {
    expect(content).toMatch(/function\s+highlightElement\s*\(/);
    expect(content).toMatch(/function\s+startElementPicker\s*\(/);
    expect(content).toMatch(/function\s+stopElementPicker\s*\(/);
  });

  test("listens for start element picker message", () => {
    expect(content).toContain('message.type === "START_ELEMENT_PICKER"');
    expect(content).toContain("startElementPicker()");
  });

  test("stores picked rule in chrome storage", () => {
    expect(content).toContain("pendingPickedRule");
    expect(content).toContain("containerSelector: selector");
    expect(content).toContain("textSelector: null");
  });

  test("supports escape key to cancel picker", () => {
    expect(content).toContain('event.key === "Escape"');
    expect(content).toContain("Element picker cancelled");
  });
});
