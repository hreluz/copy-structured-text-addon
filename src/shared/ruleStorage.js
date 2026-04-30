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

function toggleRule(rules, index) {
  return rules.map((rule, currentIndex) => {
    if (currentIndex !== index) return rule;
    return { ...rule, enabled: rule.enabled === false ? true : false };
  });
}

if (typeof module !== "undefined") {
  module.exports = {
    addRule,
    updateRule,
    deleteRule,
    toggleRule
  };
}
