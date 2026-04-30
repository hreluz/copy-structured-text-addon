const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

describe("popup.html structure", () => {
  let document;

  beforeAll(() => {
    const html = fs.readFileSync(path.resolve(__dirname, "../src/popup.html"), "utf-8");

    const dom = new JSDOM(html);
    document = dom.window.document;
  });

  test("has custom rules list", () => {
    const el = document.getElementById("rules-list");
    expect(el).not.toBeNull();
  });

  test("has merged rules list", () => {
    const el = document.getElementById("merged-rules-list");
    expect(el).not.toBeNull();
  });

  test("loads scripts in correct order", () => {
    const scripts = [...document.querySelectorAll("script")].map((s) => s.getAttribute("src"));

    expect(scripts).toEqual([
      "defaultRules.js",
      "ruleStorage.js",
      "ruleMerger.js",
      "selectorValidation.js",
      "rulesImportExport.js",
      "popup.js"
    ]);
  });

  test("has pick element button", () => {
    const el = document.getElementById("pickElementButton");
    expect(el).not.toBeNull();
  });

  test("loads popup.js script", () => {
    const scripts = [...document.querySelectorAll("script")].map((s) => s.getAttribute("src"));

    expect(scripts).toContain("popup.js");
  });

  test("has cancel edit button", () => {
    const button = document.getElementById("cancelEditButton");

    expect(button).not.toBeNull();
    expect(button.getAttribute("type")).toBe("button");
  });

  test("cancel button starts hidden", () => {
    const button = document.getElementById("cancelEditButton");

    expect(button.classList.contains("hidden")).toBe(true);
  });

  test("has pick element button", () => {
    const button = document.getElementById("pickElementButton");

    expect(button).not.toBeNull();
    expect(button.getAttribute("type")).toBe("button");
  });
});
