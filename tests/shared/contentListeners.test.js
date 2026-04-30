const fs = require("fs");
const path = require("path");

describe("contentListeners.js structure", () => {
  let source;

  beforeAll(() => {
    source = fs.readFileSync(path.resolve(__dirname, "../../src/shared/contentListeners.js"), "utf-8");
  });

  test("defines lastRightClickedResult state", () => {
    expect(source).toContain("let lastRightClickedResult");
  });

  test("captures right-clicked element on contextmenu", () => {
    expect(source).toContain('addEventListener("contextmenu"');
    expect(source).toContain("extractTextResult(event.target, rules)");
  });

  test("handles COPY_STRUCTURED_TEXT message", () => {
    expect(source).toContain('message.type !== "COPY_STRUCTURED_TEXT"');
    expect(source).toContain("navigator.clipboard.writeText");
  });

  test("handles START_ELEMENT_PICKER message", () => {
    expect(source).toContain('message.type === "START_ELEMENT_PICKER"');
    expect(source).toContain("startElementPicker()");
  });

  test("persists last matched rule to storage", () => {
    expect(source).toContain("lastMatchedRule");
    expect(source).toContain(
      'const ruleName = lastRightClickedResult.rule?.name || "Unknown rule"'
    );
  });

  test("shows toast after copy", () => {
    expect(source).toContain("showCopyToast(`Copied using rule: ${ruleName}`)");
  });

  test("does not export module (browser-only auto-executing file)", () => {
    expect(source).not.toContain("module.exports");
  });
});
