const {
  launchBrowser,
  openPopup,
  createFixtureServer,
  sendMessageToTab,
  clearStorage,
  sleep
} = require("./helpers/browser");

let browser, extensionId, popupPage, server, fixtureUrl;

const matchingRule = {
  name: "Card Title",
  containerSelector: "div",
  textSelector: '[data-testid^="title-"]'
};

const nonMatchingRule = {
  name: "Will Not Match",
  containerSelector: ".nonexistent-container",
  textSelector: null
};

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

describe("Rule tester", () => {
  test("shows match toast when clicking an element that matches the rule", async () => {
    const fixturePage = await browser.newPage();
    await fixturePage.goto(fixtureUrl);
    await sleep(500);

    await sendMessageToTab(browser, "localhost", {
      type: "TEST_RULE",
      rule: matchingRule
    });
    await sleep(200);

    // Click the matching element — handleTesterClick fires
    await fixturePage.click('[data-testid="title-1"]');

    const toast = await fixturePage.waitForSelector("#copy-structured-text-toast");
    const toastText = await toast.evaluate((el) => el.textContent);

    expect(toastText).toContain("Test match:");
    expect(toastText).toContain("Task Alpha");
    expect(toastText).toContain("Card Title");

    await fixturePage.close();
  });

  test("shows no-match toast when clicking an element that does not match", async () => {
    const fixturePage = await browser.newPage();
    await fixturePage.goto(fixtureUrl);
    await sleep(500);

    await sendMessageToTab(browser, "localhost", {
      type: "TEST_RULE",
      rule: nonMatchingRule
    });
    await sleep(200);

    // Click an element — no ancestor matches .nonexistent-container
    await fixturePage.click("a.link");

    const toast = await fixturePage.waitForSelector("#copy-structured-text-toast");
    const toastText = await toast.evaluate((el) => el.textContent);

    expect(toastText).toContain("Test: No match for rule");
    expect(toastText).toContain("Will Not Match");

    await fixturePage.close();
  });

  test("pressing Escape in test mode shows cancellation toast", async () => {
    const fixturePage = await browser.newPage();
    await fixturePage.goto(fixtureUrl);
    await sleep(500);

    await sendMessageToTab(browser, "localhost", {
      type: "TEST_RULE",
      rule: matchingRule
    });
    await sleep(200);

    await fixturePage.keyboard.press("Escape");

    const toast = await fixturePage.waitForSelector("#copy-structured-text-toast");
    const toastText = await toast.evaluate((el) => el.textContent);

    expect(toastText).toContain("Rule test cancelled");

    await fixturePage.close();
  });
});
