function addRule(rules, rule) {
  return [rule, ...rules];
}

function updateRule(rules, index, updatedRule) {
  return rules.map((rule, currentIndex) => {
    if (currentIndex === index) {
      return updatedRule;
    }

    return rule;
  });
}

function deleteRule(rules, index) {
  return rules.filter((_, currentIndex) => currentIndex !== index);
}

if (typeof module !== "undefined") {
  module.exports = {
    addRule,
    updateRule,
    deleteRule
  };
}
