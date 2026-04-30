const { JSDOM } = require("jsdom");
const { getElementSelector } = require("../../src/shared/elementSelector");

let document;

beforeAll(() => {
  const dom = new JSDOM("<!DOCTYPE html><body></body>");

  document = dom.window.document;

  global.document = document;

  // Mock CSS.escape
  global.CSS = {
    escape: (value) => String(value).replace(/"/g, '\\"')
  };
});

describe("getElementSelector", () => {
  test("uses dynamic data-testid prefix before id or class", () => {
    const dom = new JSDOM(`
    <span id="title" data-testid="title-4" class="auth-title">
      Dashboard
    </span>
  `);

    const element = dom.window.document.querySelector("span");

    expect(getElementSelector(element)).toBe('[data-testid^="title-"]');
  });

  test("uses id when data-testid is missing", () => {
    const dom = new JSDOM(`
      <h1 id="headerleft" class="auth-title">Dashboard</h1>
    `);

    const element = dom.window.document.querySelector("h1");

    expect(getElementSelector(element)).toBe("#headerleft");
  });

  test("uses stable classes when data-testid and id are missing", () => {
    const dom = new JSDOM(`
      <h1 class="auth-title htb-mb-24">Dashboard</h1>
    `);

    const element = dom.window.document.querySelector("h1");

    expect(getElementSelector(element)).toBe("h1.auth-title.htb-mb-24");
  });

  test("ignores generated-looking classes", () => {
    const dom = new JSDOM(`
      <span class="sc-bqnEYs item-title generated__x modifier--y class123456">
        Text
      </span>
    `);

    const element = dom.window.document.querySelector("span");

    expect(getElementSelector(element)).toBe("span.item-title");
  });

  test("falls back to tag name", () => {
    const dom = new JSDOM(`
      <section>Content</section>
    `);

    const element = dom.window.document.querySelector("section");

    expect(getElementSelector(element)).toBe("section");
  });

  test("returns body for missing element", () => {
    expect(getElementSelector(null)).toBe("body");
  });

  test("uses prefix selector for dynamic data-testid ending in number", () => {
    const dom = new JSDOM(`
    <span data-testid="title-3">A01: Broken Access Control</span>
  `);

    const element = dom.window.document.querySelector("span");

    expect(getElementSelector(element)).toBe('[data-testid^="title-"]');
  });

  test("handles complex dynamic data-testid", () => {
    const dom = new JSDOM(`
    <div data-testid="card-item-42">Item</div>
  `);

    const element = dom.window.document.querySelector("div");

    expect(getElementSelector(element)).toBe('[data-testid^="card-item-"]');
  });

  test("uses exact data-testid when not dynamic", () => {
    const dom = new JSDOM(`
    <span id="title" data-testid="header-title" class="auth-title">
      Dashboard
    </span>
  `);

    const element = dom.window.document.querySelector("span");

    expect(getElementSelector(element)).toBe('[data-testid="header-title"]');
  });
});
