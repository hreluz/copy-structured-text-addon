const { mergeRules } = require("./ruleMerger");

describe("mergeRules", () => {
  test("merges rules in priority order", () => {
    const uiRules = [{ name: "UI Rule" }];
    const fileRules = [{ name: "JSON Rule" }];
    const defaultRules = [{ name: "Default Rule" }];

    const result = mergeRules(uiRules, fileRules, defaultRules);

    expect(result).toEqual([{ name: "UI Rule" }, { name: "JSON Rule" }, { name: "Default Rule" }]);
  });
});
