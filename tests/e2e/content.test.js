const {
  launchBrowser,
  openPopup,
  createFixtureServer,
  sendMessageToTab,
  getStorage,
  setStorage,
  clearStorage,
  sleep
} = require("./helpers/browser");

let browser, extensionId, popupPage, server, fixtureUrl;

beforeAll(async () => {
  ({ browser, extensionId } = await launchBrowser());
  ({ server, url: fixtureUrl } = await createFixtureServer());
  popupPage = await openPopup(browser, extensionId);
});

afterAll(async () => {
  await popupPage.close();
  await browser.close();
  server.close();
});

beforeEach(async () => {
  await clearStorage(popupPage);
});

describe("Content script copy flow", () => {
  test("copies text and saves lastMatchedRule using a default rule", async () => {
    const fixturePage = await browser.newPage();
    await fixturePage.goto(fixtureUrl);

    // Wait for content script + async loadRules() to finish
    await sleep(500);

    // Simulate right-click on the task title span
    await fixturePage.evaluate(() => {
      const el = document.querySelector('[data-testid="title-1"]');
      el.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true }));
    });

    await sendMessageToTab(browser, "localhost", { type: "COPY_STRUCTURED_TEXT" });
    await sleep(300);

    const { lastMatchedRule } = await getStorage(popupPage, ["lastMatchedRule"]);

    expect(lastMatchedRule).toBeDefined();
    expect(lastMatchedRule.text).toBe("Task Alpha");
    expect(lastMatchedRule.ruleName).toBe("Task title");

    await fixturePage.close();
  });

  test("copies link text using the default link rule", async () => {
    const fixturePage = await browser.newPage();
    await fixturePage.goto(fixtureUrl);
    await sleep(500);

    await fixturePage.evaluate(() => {
      const el = document.querySelector("a.link");
      el.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true }));
    });

    await sendMessageToTab(browser, "localhost", { type: "COPY_STRUCTURED_TEXT" });
    await sleep(300);

    const { lastMatchedRule } = await getStorage(popupPage, ["lastMatchedRule"]);

    expect(lastMatchedRule.text).toBe("Example Link");
    expect(lastMatchedRule.ruleName).toBe("Normal link text");

    await fixturePage.close();
  });

  test("skips disabled custom rule and falls back to next matching rule", async () => {
    // A high-priority custom rule that matches .card but is disabled
    await setStorage(popupPage, {
      customRules: [
        {
          name: "Disabled Rule",
          containerSelector: "div",
          textSelector: '[data-testid^="title-"]',
          enabled: false
        }
      ]
    });

    const fixturePage = await browser.newPage();
    await fixturePage.goto(fixtureUrl);
    await sleep(500);

    await fixturePage.evaluate(() => {
      const el = document.querySelector('[data-testid="title-1"]');
      el.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true }));
    });

    await sendMessageToTab(browser, "localhost", { type: "COPY_STRUCTURED_TEXT" });
    await sleep(300);

    const { lastMatchedRule } = await getStorage(popupPage, ["lastMatchedRule"]);

    // Should have fallen through to the DEFAULT_RULES "Task title" rule
    expect(lastMatchedRule.text).toBe("Task Alpha");
    expect(lastMatchedRule.ruleName).toBe("Task title");

    await fixturePage.close();
  });
});
