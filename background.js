chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "copy-structured-text",
      title: "Copy structured text",
      contexts: ["all"]
    });
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "copy-structured-text") return;
  if (!tab?.id) return;

  try {
    await chrome.tabs.sendMessage(tab.id, {
      type: "COPY_STRUCTURED_TEXT"
    });
  } catch (error) {
    console.warn("Content script is not available on this page:", error.message);
  }
});