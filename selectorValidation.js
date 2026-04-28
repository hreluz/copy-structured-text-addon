function isValidSelector(selector) {
  if (selector === null || selector === "") {
    return true;
  }

  if (typeof selector !== "string") {
    return false;
  }

  try {
    document.createDocumentFragment().querySelector(selector);
    return true;
  } catch {
    return false;
  }
}

function validateRule(rule) {
  const errors = [];

  if (!rule.name || !rule.name.trim()) {
    errors.push("Name is required.");
  }

  if (!rule.containerSelector || !rule.containerSelector.trim()) {
    errors.push("Container selector is required.");
  }

  if (!isValidSelector(rule.containerSelector)) {
    errors.push("Container selector is invalid.");
  }

  if (!isValidSelector(rule.textSelector)) {
    errors.push("Text selector is invalid.");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

if (typeof module !== "undefined") {
  module.exports = {
    isValidSelector,
    validateRule
  };
}
