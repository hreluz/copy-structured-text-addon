const fs = require("fs");
const path = require("path");

describe("content.js structure", () => {
  let content;

  beforeAll(() => {
    content = fs.readFileSync(
      path.resolve(__dirname, "content.js"),
      "utf-8"
    );
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
});