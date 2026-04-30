const { JSDOM } = require("jsdom");
const { isValidSelector, validateRule } = require("../src/selectorValidation");

beforeAll(() => {
  const dom = new JSDOM("<!DOCTYPE html><body></body>");
  global.document = dom.window.document;
});

describe("selectorValidation", () => {
  test("accepts valid class selector", () => {
    expect(isValidSelector(".card")).toBe(true);
  });

  test("accepts valid id selector", () => {
    expect(isValidSelector("#headerleft")).toBe(true);
  });

  test("accepts valid attribute selector", () => {
    expect(isValidSelector('[data-testid^="title-"]')).toBe(true);
  });

  test("accepts null or empty text selector", () => {
    expect(isValidSelector(null)).toBe(true);
    expect(isValidSelector("")).toBe(true);
  });

  test("rejects invalid selector", () => {
    expect(isValidSelector(".card[")).toBe(false);
  });

  test("validates a correct rule", () => {
    const rule = {
      name: "Card title",
      containerSelector: ".card",
      textSelector: ".title"
    };

    expect(validateRule(rule)).toEqual({
      isValid: true,
      errors: []
    });
  });

  test("rejects rule without name", () => {
    const result = validateRule({
      name: "",
      containerSelector: ".card",
      textSelector: ".title"
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Name is required.");
  });

  test("rejects invalid container selector", () => {
    const result = validateRule({
      name: "Bad rule",
      containerSelector: ".card[",
      textSelector: ".title"
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Container selector is invalid.");
  });

  test("rejects invalid text selector", () => {
    const result = validateRule({
      name: "Bad rule",
      containerSelector: ".card",
      textSelector: ".title["
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Text selector is invalid.");
  });
});
