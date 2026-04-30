const fs = require("fs");
const path = require("path");

describe("rulesLoader.js structure", () => {
  let source;

  beforeAll(() => {
    source = fs.readFileSync(path.resolve(__dirname, "../src/shared/rulesLoader.js"), "utf-8");
  });

  test("defines rules state", () => {
    expect(source).toContain("let rules = []");
  });

  test("defines loadRules function", () => {
    expect(source).toMatch(/async function\s+loadRules\s*\(/);
  });

  test("merges all rule sources", () => {
    expect(source).toContain("mergeRules(customRules, fileRules, DEFAULT_RULES)");
  });

  test("fetches copyRules.json via extension URL", () => {
    expect(source).toContain('chrome.runtime.getURL("src/copyRules.json")');
  });

  test("calls loadRules on init", () => {
    expect(source).toContain("loadRules()");
  });

  test("reloads rules when customRules storage changes", () => {
    expect(source).toContain("chrome.storage.onChanged.addListener");
    expect(source).toContain("changes.customRules");
  });

  test("does not export module (browser-only auto-executing file)", () => {
    expect(source).not.toContain("module.exports");
  });
});
