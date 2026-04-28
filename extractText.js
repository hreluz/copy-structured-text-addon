function extractTextResult(target, rules) {
  if (!target || !Array.isArray(rules)) {
    return {
      text: null,
      rule: null
    };
  }

  for (const rule of rules) {
    const container = target.closest(rule.containerSelector);

    if (!container) {continue;}

    const element = rule.textSelector
      ? container.querySelector(rule.textSelector)
      : container;

    if (!element) {continue;}

    const text = element.textContent.trim();

    if (text) {
      return {
        text,
        rule
      };
    }
  }

  return {
    text: null,
    rule: null
  };
}

function extractText(target, rules) {
  return extractTextResult(target, rules).text;
}

if (typeof module !== "undefined") {
  module.exports = {
    extractText,
    extractTextResult
  };
}