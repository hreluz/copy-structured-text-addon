const { serializeRules, parseRulesJson } = require("./rulesImportExport");

describe("rulesImportExport", () => {
  test("serializes rules as pretty JSON", () => {
    const rules = [
      {
        name: "Header",
        containerSelector: "body",
        textSelector: "#headerleft"
      }
    ];

    expect(serializeRules(rules)).toBe(JSON.stringify(rules, null, 2));
  });

  test("parses valid rules JSON", () => {
    const json = JSON.stringify([
      {
        name: "Header",
        containerSelector: "body",
        textSelector: "#headerleft"
      }
    ]);

    expect(parseRulesJson(json)).toEqual([
      {
        name: "Header",
        containerSelector: "body",
        textSelector: "#headerleft"
      }
    ]);
  });

  test("rejects invalid JSON", () => {
    expect(() => parseRulesJson("{bad json")).toThrow();
  });

  test("rejects JSON object instead of array", () => {
    const json = JSON.stringify({
      name: "Header",
      containerSelector: "body",
      textSelector: "#headerleft"
    });

    expect(() => parseRulesJson(json)).toThrow("Invalid rules file. Expected a JSON array.");
  });
});
