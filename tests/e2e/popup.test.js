const { launchBrowser, openPopup, setStorage, clearStorage } = require("./helpers/browser");

let browser, extensionId;

beforeAll(async () => {
  ({ browser, extensionId } = await launchBrowser());
});

afterAll(async () => {
  await browser.close();
});

describe("Popup rule management", () => {
  let page;

  beforeEach(async () => {
    page = await openPopup(browser, extensionId);
    await clearStorage(page);
    await page.reload();
    await page.waitForSelector("#rules-list");
  });

  afterEach(async () => {
    await page.close().catch(() => {});
  });

  test("shows empty state when no rules exist", async () => {
    const text = await page.$eval("#rules-list", (el) => el.textContent);
    expect(text).toContain("No custom rules yet.");
  });

  test("adds a new rule via the form", async () => {
    await page.type("#name", "My Rule");
    await page.type("#containerSelector", ".card");
    await page.type("#textSelector", ".title");
    await page.click("#submitButton");

    await page.waitForFunction(() =>
      document.querySelector("#rules-list").textContent.includes("My Rule")
    );

    const text = await page.$eval("#rules-list", (el) => el.textContent);
    expect(text).toContain("My Rule");
    expect(text).toContain(".card");
  });

  test("edits an existing rule", async () => {
    await page.type("#name", "Original Name");
    await page.type("#containerSelector", ".card");
    await page.click("#submitButton");
    await page.waitForFunction(() =>
      document.querySelector("#rules-list").textContent.includes("Original Name")
    );

    await page.click(".edit-btn");
    await page.$eval("#name", (el) => {
      el.value = "";
    });
    await page.type("#name", "Updated Name");
    await page.click("#submitButton");

    await page.waitForFunction(() =>
      document.querySelector("#rules-list").textContent.includes("Updated Name")
    );

    const text = await page.$eval("#rules-list", (el) => el.textContent);
    expect(text).toContain("Updated Name");
    expect(text).not.toContain("Original Name");
  });

  test("disables a rule and shows the disabled badge", async () => {
    await page.type("#name", "Toggle Rule");
    await page.type("#containerSelector", ".card");
    await page.click("#submitButton");
    await page.waitForFunction(() =>
      document.querySelector("#rules-list").textContent.includes("Toggle Rule")
    );

    await page.click(".toggle-btn");
    await page.waitForSelector(".disabled-badge");

    const btnText = await page.$eval(".toggle-btn", (el) => el.textContent);
    expect(btnText).toBe("Enable");
  });

  test("re-enables a disabled rule removes the badge", async () => {
    await setStorage(page, {
      customRules: [
        {
          name: "Off Rule",
          containerSelector: ".card",
          textSelector: null,
          enabled: false
        }
      ]
    });
    await page.reload();
    await page.waitForSelector(".disabled-badge");

    await page.click(".toggle-btn");
    await page.waitForFunction(() => !document.querySelector(".disabled-badge"));

    const badge = await page.$(".disabled-badge");
    expect(badge).toBeNull();

    const btnText = await page.$eval(".toggle-btn", (el) => el.textContent);
    expect(btnText).toBe("Disable");
  });

  test("deletes a rule", async () => {
    await page.type("#name", "Delete Me");
    await page.type("#containerSelector", ".card");
    await page.click("#submitButton");
    await page.waitForFunction(() =>
      document.querySelector("#rules-list").textContent.includes("Delete Me")
    );

    await page.click(".delete-btn");
    await page.waitForFunction(() =>
      document.querySelector("#rules-list").textContent.includes("No custom rules yet.")
    );

    const text = await page.$eval("#rules-list", (el) => el.textContent);
    expect(text).toContain("No custom rules yet.");
  });

  test("new rule appears in the Final Rule Order merged list", async () => {
    await page.type("#name", "Merged Rule");
    await page.type("#containerSelector", ".my-container");
    await page.click("#submitButton");

    await page.waitForFunction(() =>
      document.querySelector("#merged-rules-list").textContent.includes("Merged Rule")
    );

    const source = await page.$eval(
      "#merged-rules-list",
      (el) => el.querySelector(".source")?.textContent
    );
    expect(source).toBe("(UI)");
  });

  test("Test button sends TEST_RULE message with the correct rule", async () => {
    const rule = { name: "Test Rule", containerSelector: ".card", textSelector: null };
    await setStorage(page, { customRules: [rule] });
    await page.reload();
    await page.waitForFunction(
      () => !document.querySelector("#rules-list").textContent.includes("No custom rules yet.")
    );

    // Intercept chrome.tabs.sendMessage to capture what was sent
    const sentMessage = await page.evaluate(async () => {
      return new Promise((resolve) => {
        const original = chrome.tabs.sendMessage.bind(chrome.tabs);
        chrome.tabs.sendMessage = async (_tabId, msg) => {
          resolve(msg);
          return original(_tabId, msg).catch(() => {});
        };
        document.querySelector(".test-btn").click();
      });
    });

    expect(sentMessage.type).toBe("TEST_RULE");
    expect(sentMessage.rule.name).toBe("Test Rule");
    expect(sentMessage.rule.containerSelector).toBe(".card");
  });
});
