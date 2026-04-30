const { addRule, updateRule, deleteRule } = require("../src/ruleStorage");

describe("ruleStorage", () => {
  test("adds a new rule at the beginning (UI behavior)", () => {
    const existingRules = [
      {
        name: "Existing rule",
        containerSelector: "a",
        textSelector: null
      }
    ];

    const newRule = {
      name: "New rule",
      containerSelector: ".card",
      textSelector: ".title"
    };

    const result = addRule(existingRules, newRule);

    expect(result).toEqual([newRule, existingRules[0]]);
  });

  test("updates an existing rule by index (edit mode)", () => {
    const rules = [
      {
        name: "Rule 1",
        containerSelector: "a",
        textSelector: null
      },
      {
        name: "Rule 2",
        containerSelector: ".card",
        textSelector: ".title"
      }
    ];

    const updatedRule = {
      name: "Updated Rule 2",
      containerSelector: ".updated-card",
      textSelector: ".updated-title"
    };

    const result = updateRule(rules, 1, updatedRule);

    expect(result).toEqual([rules[0], updatedRule]);
  });

  test("delete removes correct rule (UI delete button)", () => {
    const rules = [
      {
        name: "Rule 1",
        containerSelector: "a",
        textSelector: null
      },
      {
        name: "Rule 2",
        containerSelector: ".card",
        textSelector: ".title"
      }
    ];

    const result = deleteRule(rules, 0);

    expect(result).toEqual([rules[1]]);
  });

  test("update does not mutate original array (important)", () => {
    const rules = [
      {
        name: "Rule 1",
        containerSelector: "a",
        textSelector: null
      }
    ];

    const updatedRule = {
      name: "Updated",
      containerSelector: ".x",
      textSelector: ".y"
    };

    const result = updateRule(rules, 0, updatedRule);

    expect(result).not.toBe(rules); // new array
    expect(rules[0].name).toBe("Rule 1"); // original untouched
  });

  test("delete does not mutate original array", () => {
    const rules = [{ name: "Rule 1", containerSelector: "a", textSelector: null }];

    const result = deleteRule(rules, 0);

    expect(result).not.toBe(rules);
    expect(rules.length).toBe(1);
  });

  test("adding multiple rules preserves order (new first)", () => {
    let rules = [];

    rules = addRule(rules, { name: "Rule 1", containerSelector: "a" });
    rules = addRule(rules, { name: "Rule 2", containerSelector: ".b" });

    expect(rules[0].name).toBe("Rule 2");
    expect(rules[1].name).toBe("Rule 1");
  });
});
