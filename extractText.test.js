const { JSDOM } = require("jsdom");
const { extractText } = require("./extractText");
const { DEFAULT_RULES } = require("./defaultRules");

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

  const { extractTextResult } = require("./extractText");

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
});
