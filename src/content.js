console.log("Copy Structured Text content script loaded");

let lastRightClickedResult = {
  text: null,
  rule: null
};

let rules = [];

function showCopyToast(message) {
  const existingToast = document.getElementById("copy-structured-text-toast");

  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.id = "copy-structured-text-toast";
  toast.textContent = message;

  toast.style.position = "fixed";
  toast.style.top = "16px";
  toast.style.right = "16px";
  toast.style.zIndex = "999999";
  toast.style.padding = "10px 14px";
  toast.style.background = "#111";
  toast.style.color = "#fff";
  toast.style.borderRadius = "6px";
  toast.style.fontSize = "13px";
  toast.style.fontFamily = "Arial, sans-serif";
  toast.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.25)";

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2500);
}

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

document.addEventListener("contextmenu", (event) => {
  lastRightClickedResult = extractTextResult(event.target, rules);

  console.log("Right-click target:", event.target);
  console.log("Last clicked result:", lastRightClickedResult);
});

chrome.runtime.onMessage.addListener(async (message) => {
  console.log("Message received:", message);

  if (message.type === "START_ELEMENT_PICKER") {
    startElementPicker();
    return;
  }

  if (message.type !== "COPY_STRUCTURED_TEXT") {
    return;
  }

  if (!lastRightClickedResult.text) {
    alert("No valid text found.");
    return;
  }

  await navigator.clipboard.writeText(lastRightClickedResult.text);

  const ruleName = lastRightClickedResult.rule?.name || "Unknown rule";

  await chrome.storage.local.set({
    lastMatchedRule: {
      ruleName,
      text: lastRightClickedResult.text,
      copiedAt: new Date().toISOString()
    }
  });

  showCopyToast(`Copied using rule: ${ruleName}`);

  console.log("Copied:", lastRightClickedResult.text);
});
