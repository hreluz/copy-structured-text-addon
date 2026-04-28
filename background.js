chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "copy-structured-text",
    title: "Copy structured text",
    contexts: ["all"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== "copy-structured-text") return;

  chrome.tabs.sendMessage(tab.id, {
    type: "COPY_STRUCTURED_TEXT"
  });
});