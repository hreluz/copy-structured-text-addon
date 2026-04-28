console.log("Copy Structured Text content script loaded");

let lastRightClickedResult = {
  text: null,
  rule: null
};

let rules = [];

async function loadRules() {
  const stored = await chrome.storage.local.get(["customRules"]);
  const customRules = stored.customRules || [];

  let fileRules = [];

  try {
    const url = chrome.runtime.getURL("copyRules.json");
    const response = await fetch(url);

    if (response.ok) {
      fileRules = await response.json();
    }
  } catch (error) {
    fileRules = [];
  }

  rules = mergeRules(customRules, fileRules, DEFAULT_RULES);

  console.log("Rules loaded:", rules);
}

loadRules();

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;

  if (changes.customRules) {
    loadRules();
  }
});

document.addEventListener("contextmenu", (event) => {
  lastRightClickedResult = extractTextResult(event.target, rules);

  console.log("Right-click target:", event.target);
  console.log("Last clicked result:", lastRightClickedResult);
});

chrome.runtime.onMessage.addListener(async (message) => {
  console.log("Message received:", message);

  if (message.type !== "COPY_STRUCTURED_TEXT") return;

  if (!lastRightClickedResult.text) {
    alert("No valid text found.");
    return;
  }

  await navigator.clipboard.writeText(lastRightClickedResult.text);

  await chrome.storage.local.set({
    lastMatchedRule: {
      ruleName: lastRightClickedResult.rule?.name || null,
      text: lastRightClickedResult.text,
      copiedAt: new Date().toISOString()
    }
  });

  console.log("Copied:", lastRightClickedResult.text);
});