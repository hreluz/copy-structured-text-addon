const { JSDOM } = require("jsdom");
const { extractText } = require("../../src/shared/extractText");
const { DEFAULT_RULES } = require("../../src/shared/defaultRules");

describe("extractText", () => {
  test("uses UI rules first", () => {
    const uiRules = [
      {
        name: "UI rule",
        containerSelector: "div",
        textSelector: ".ui-title"
      }
    ];

    const fileRules = [
      {
        name: "File rule",
        containerSelector: "div",
        textSelector: ".file-title"
      }
    ];

    const rules = [...uiRules, ...fileRules, ...DEFAULT_RULES];

    const dom = new JSDOM(`
      <div>
        <span class="ui-title">UI Title</span>
        <span class="file-title">File Title</span>
        <span data-testid="title-4">Default Title</span>
      </div>
    `);

    const target = dom.window.document.querySelector("div");

    expect(extractText(target, rules)).toBe("UI Title");
  });

  test("uses file rules before default rules", () => {
    const fileRules = [
      {
        name: "File rule",
        containerSelector: "div",
        textSelector: ".file-title"
      }
    ];

    const rules = [...fileRules, ...DEFAULT_RULES];

    const dom = new JSDOM(`
      <div>
        <span class="file-title">File Title</span>
        <span data-testid="title-4">Default Title</span>
      </div>
    `);

    const target = dom.window.document.querySelector("div");

    expect(extractText(target, rules)).toBe("File Title");
  });

  test("falls back to default rules", () => {
    const dom = new JSDOM(`
      <div>
        <span>Task 4</span>
        <span data-testid="title-4">Default Title</span>
      </div>
    `);

    const target = dom.window.document.querySelector("div");

    expect(extractText(target, DEFAULT_RULES)).toBe("Default Title");
  });

  test("uses default link rule", () => {
    const dom = new JSDOM(`
      <a href="https://example.com">Example Link</a>
    `);

    const target = dom.window.document.querySelector("a");

    expect(extractText(target, DEFAULT_RULES)).toBe("Example Link");
  });

  test("returns null when no rule matches", () => {
    const dom = new JSDOM(`
      <button>Click me</button>
    `);

    const target = dom.window.document.querySelector("button");

    expect(extractText(target, DEFAULT_RULES)).toBe(null);
  });

  const { extractTextResult } = require("../../src/shared/extractText");

  test("returns matched rule with extracted text", () => {
    const rule = {
      name: "Header rule",
      containerSelector: "body",
      textSelector: "#headerleft"
    };

    const dom = new JSDOM(`
      <body>
        <h1 id="headerleft">Dashboard</h1>
      </body>
    `);

    const target = dom.window.document.body;

    expect(extractTextResult(target, [rule])).toEqual({
      text: "Dashboard",
      rule
    });
  });

  test("skips rule when textSelector matches nothing inside container", () => {
    const noMatchRule = {
      name: "Missing element",
      containerSelector: "div",
      textSelector: ".nonexistent"
    };

    const fallbackRule = {
      name: "Fallback",
      containerSelector: "div",
      textSelector: ".real"
    };

    const dom = new JSDOM(`<div><span class="real">Found</span></div>`);
    const target = dom.window.document.querySelector("div");

    expect(extractTextResult(target, [noMatchRule, fallbackRule])).toEqual({
      text: "Found",
      rule: fallbackRule
    });
  });

  test("skips rule when container text is empty after trim", () => {
    const whitespaceRule = {
      name: "Empty container",
      containerSelector: ".inner",
      textSelector: null
    };

    const realRule = {
      name: "Real content",
      containerSelector: ".outer",
      textSelector: ".label"
    };

    // target is inside .inner (whitespace-only); .outer is the ancestor with real text
    const dom = new JSDOM(`
      <div class="outer">
        <div class="inner">   </div>
        <span class="label">Hello</span>
      </div>
    `);

    const target = dom.window.document.querySelector(".inner");

    expect(extractTextResult(target, [whitespaceRule, realRule])).toEqual({
      text: "Hello",
      rule: realRule
    });
  });

  test("skips a disabled rule and falls through to the next", () => {
    const disabledRule = {
      name: "Disabled rule",
      containerSelector: "div",
      textSelector: ".title",
      enabled: false
    };

    const activeRule = {
      name: "Active rule",
      containerSelector: "div",
      textSelector: ".title"
    };

    const dom = new JSDOM(`<div><span class="title">Hello</span></div>`);
    const target = dom.window.document.querySelector("div");

    expect(extractTextResult(target, [disabledRule, activeRule])).toEqual({
      text: "Hello",
      rule: activeRule
    });
  });

  test("does not skip a rule with enabled: true explicitly set", () => {
    const rule = {
      name: "Explicit enabled",
      containerSelector: "div",
      textSelector: ".title",
      enabled: true
    };

    const dom = new JSDOM(`<div><span class="title">Hello</span></div>`);
    const target = dom.window.document.querySelector("div");

    expect(extractTextResult(target, [rule])).toEqual({ text: "Hello", rule });
  });

  test("returns null when all rules are disabled", () => {
    const rules = [
      { name: "R1", containerSelector: "div", textSelector: null, enabled: false },
      { name: "R2", containerSelector: "div", textSelector: null, enabled: false }
    ];

    const dom = new JSDOM(`<div>Hello</div>`);
    const target = dom.window.document.querySelector("div");

    expect(extractTextResult(target, rules)).toEqual({ text: null, rule: null });
  });

  test("returns null text and null rule when target is null", () => {
    expect(extractTextResult(null, DEFAULT_RULES)).toEqual({ text: null, rule: null });
  });

  test("returns null text and null rule when rules is not an array", () => {
    const dom = new JSDOM(`<div>Hello</div>`);
    const target = dom.window.document.querySelector("div");

    expect(extractTextResult(target, null)).toEqual({ text: null, rule: null });
  });
});
