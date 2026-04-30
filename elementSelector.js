/* global document, CSS, module */
function getElementSelector(element) {
  if (!element || element === document.body) {
    return "body";
  }

  const tag = element.tagName.toLowerCase();

  const testId = element.getAttribute("data-testid");

  if (testId) {
    const dynamicTestIdMatch = testId.match(/^(.+-)\d+$/);

    if (dynamicTestIdMatch) {
      return `[data-testid^="${CSS.escape(dynamicTestIdMatch[1])}"]`;
    }

    return `[data-testid="${CSS.escape(testId)}"]`;
  }

  if (element.id) {
    return `#${CSS.escape(element.id)}`;
  }

  const stableClasses = [...element.classList].filter((className) => {
    return (
      !className.startsWith("sc-") &&
      !className.includes("__") &&
      !className.includes("--") &&
      !/[0-9]{4,}/.test(className)
    );
  });

  if (stableClasses.length > 0) {
    return `${tag}${stableClasses
      .slice(0, 3)
      .map((className) => `.${CSS.escape(className)}`)
      .join("")}`;
  }

  return tag;
}

if (typeof module !== "undefined") {
  module.exports = {
    getElementSelector
  };
}
