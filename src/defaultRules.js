const DEFAULT_RULES = [
  {
    name: "Task title",
    containerSelector: "div",
    textSelector: '[data-testid^="title-"]'
  },
  {
    name: "Normal link text",
    containerSelector: "a",
    textSelector: null
  }
];

if (typeof module !== "undefined") {
  module.exports = {
    DEFAULT_RULES
  };
}
