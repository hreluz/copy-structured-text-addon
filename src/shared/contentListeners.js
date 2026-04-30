console.log("Copy Structured Text content script loaded");

let lastRightClickedResult = {
  text: null,
  rule: null
};

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

  if (message.type === "TEST_RULE") {
    startRuleTester(message.rule);
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
