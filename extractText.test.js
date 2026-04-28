const { JSDOM } = require("jsdom");
const { extractText } = require("./extractText");
const { DEFAULT_RULES } = require("./defaultRules");

describe("extractText with default rules", () => {
  test("uses default HTB rule", () => {
    const dom = new JSDOM(`
      <div>
        <span>Task 4</span>
        <span data-testid="title-4">Vulnerability VIII - Injection</span>
      </div>
    `);

    const target = dom.window.document.querySelector("span");

    expect(extractText(target, DEFAULT_RULES))
      .toBe("Vulnerability VIII - Injection");
  });

  test("uses default link fallback", () => {
    const dom = new JSDOM(`
      <a href="#">Example Link</a>
    `);

    const target = dom.window.document.querySelector("a");

    expect(extractText(target, DEFAULT_RULES))
      .toBe("Example Link");
  });

  test("external rules override defaults", () => {
    const customRules = [
      {
        name: "Override",
        containerSelector: "div",
        textSelector: ".custom"
      }
    ];

    const dom = new JSDOM(`
      <div>
        <span class="custom">Override Text</span>
        <span data-testid="title-4">Should NOT be used</span>
      </div>
    `);

    const target = dom.window.document.querySelector("div");

    const merged = [...customRules, ...DEFAULT_RULES];

    expect(extractText(target, merged)).toBe("Override Text");
  });
});