let lastRightClickedText = null;
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

  rules = [...customRules, ...fileRules, ...DEFAULT_RULES];
}

loadRules();

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;

  if (changes.customRules) {
    loadRules();
  }
});

document.addEventListener("contextmenu", (event) => {
  lastRightClickedText = extractText(event.target, rules);
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type !== "COPY_STRUCTURED_TEXT") return;

  if (!lastRightClickedText) {
    alert("No valid text found.");
    return;
  }

  navigator.clipboard.writeText(lastRightClickedText);
});