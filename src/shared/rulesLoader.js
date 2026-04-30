let rules = [];

async function loadRules() {
  const stored = await chrome.storage.local.get(["customRules"]);
  const customRules = stored.customRules || [];

  let fileRules = [];

  try {
    const url = chrome.runtime.getURL("src/copyRules.json");
    const response = await fetch(url);

    if (response.ok) {
      fileRules = await response.json();
    }
  } catch {
    fileRules = [];
  }

  rules = mergeRules(customRules, fileRules, DEFAULT_RULES);

  console.log("Rules loaded:", rules);
}

loadRules();

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") {
    return;
  }

  if (changes.customRules) {
    loadRules();
  }
});
