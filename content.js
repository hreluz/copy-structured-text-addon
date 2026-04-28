let lastRightClickedText = null;
let rules = [];

async function loadRules() {
  try {
    const url = chrome.runtime.getURL("copyRules.json");
    const response = await fetch(url);

    if (response.ok) {
      const externalRules = await response.json();
      rules = [...externalRules, ...DEFAULT_RULES];
      return;
    }
  } catch (e) {
    // ignore
  }

  // fallback to defaults only
  rules = DEFAULT_RULES;
}

loadRules();

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