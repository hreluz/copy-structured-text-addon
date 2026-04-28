function extractText(target, rules = COPY_RULES) {
  if (!target) return null;

  for (const rule of rules) {
    const container = target.closest(rule.containerSelector);

    if (!container) continue;

    const element = rule.textSelector
      ? container.querySelector(rule.textSelector)
      : container;

    if (!element) continue;

    const text = element.textContent.trim();

    if (text) return text;
  }

  return null;
}

if (typeof module !== "undefined") {
  module.exports = {
    extractText
  };
}