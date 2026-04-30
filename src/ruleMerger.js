function mergeRules(uiRules = [], fileRules = [], defaultRules = []) {
  return [...uiRules, ...fileRules, ...defaultRules];
}

if (typeof module !== "undefined") {
  module.exports = {
    mergeRules
  };
}
