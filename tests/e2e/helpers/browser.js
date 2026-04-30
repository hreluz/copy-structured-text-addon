const puppeteer = require("puppeteer");
const path = require("path");
const http = require("http");
const fs = require("fs");

const EXTENSION_PATH = path.resolve(__dirname, "../../../");

async function launchBrowser() {
  const browser = await puppeteer.launch({
    headless: process.env.PUPPETEER_HEADLESS === "false" ? false : "new",
    slowMo: process.env.PUPPETEER_SLOW_MO ? Number(process.env.PUPPETEER_SLOW_MO) : 0,
    args: [`--disable-extensions-except=${EXTENSION_PATH}`, `--load-extension=${EXTENSION_PATH}`]
  });

  const swTarget = await browser.waitForTarget(
    (t) => t.type() === "service_worker" && t.url().includes("background.js"),
    { timeout: 15000 }
  );

  const extensionId = swTarget.url().split("/")[2];
  return { browser, extensionId };
}

async function openPopup(browser, extensionId) {
  const page = await browser.newPage();
  await page.goto(`chrome-extension://${extensionId}/src/popup/popup.html`);
  await page.waitForSelector("#rules-list");
  return page;
}

function createFixtureServer() {
  const html = fs.readFileSync(path.resolve(__dirname, "../fixtures/test-page.html"), "utf-8");
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
    });
    server.listen(0, () => {
      const { port } = server.address();
      resolve({ server, url: `http://localhost:${port}/` });
    });
  });
}

// Sends a message directly to a content script tab via the service worker CDPSession.
// tabUrlFragment is a substring of the target tab's URL.
async function sendMessageToTab(browser, tabUrlFragment, message) {
  const swTarget = browser
    .targets()
    .find((t) => t.type() === "service_worker" && t.url().includes("background.js"));

  const client = await swTarget.createCDPSession();

  const { result: tabResult } = await client.send("Runtime.evaluate", {
    expression: `(async () => {
      const tabs = await chrome.tabs.query({});
      const tab = tabs.find(t => t.url && t.url.includes(${JSON.stringify(tabUrlFragment)}));
      return tab ? tab.id : null;
    })()`,
    awaitPromise: true,
    returnByValue: true
  });

  const tabId = tabResult.value;
  if (!tabId) throw new Error(`No tab found matching: ${tabUrlFragment}`);

  await client.send("Runtime.evaluate", {
    expression: `chrome.tabs.sendMessage(${tabId}, ${JSON.stringify(message)})`,
    awaitPromise: false
  });

  await client.detach();
  return tabId;
}

async function getStorage(page, keys) {
  return page.evaluate((k) => chrome.storage.local.get(k), keys);
}

async function setStorage(page, data) {
  return page.evaluate((d) => chrome.storage.local.set(d), data);
}

async function clearStorage(page) {
  return page.evaluate(() => chrome.storage.local.clear());
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

module.exports = {
  launchBrowser,
  openPopup,
  createFixtureServer,
  sendMessageToTab,
  getStorage,
  setStorage,
  clearStorage,
  sleep
};
