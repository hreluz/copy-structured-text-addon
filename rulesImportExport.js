/* global module */

function serializeRules(rules) {
  return JSON.stringify(rules, null, 2);
}

function parseRulesJson(jsonText) {
  const rules = JSON.parse(jsonText);

  if (!Array.isArray(rules)) {
    throw new Error("Invalid rules file. Expected a JSON array.");
  }

  return rules;
}

globalThis.serializeRules = serializeRules;
globalThis.parseRulesJson = parseRulesJson;

if (typeof module !== "undefined") {
  module.exports = {
    serializeRules,
    parseRulesJson
  };
}
