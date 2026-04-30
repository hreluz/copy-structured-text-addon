let pickerActive = false;
let highlightedElement = null;

function highlightElement(element) {
  if (highlightedElement) {
    highlightedElement.style.outline = "";
  }

  highlightedElement = element;
  highlightedElement.style.outline = "2px solid #00aaff";
}

function stopElementPicker() {
  pickerActive = false;

  if (highlightedElement) {
    highlightedElement.style.outline = "";
    highlightedElement = null;
  }

  document.removeEventListener("mouseover", handlePickerMouseOver, true);
  document.removeEventListener("click", handlePickerClick, true);
  document.removeEventListener("keydown", handlePickerKeyDown, true);
}

function handlePickerMouseOver(event) {
  if (!pickerActive) return;

  event.preventDefault();
  event.stopPropagation();

  highlightElement(event.target);
}

async function handlePickerClick(event) {
  if (!pickerActive) return;

  event.preventDefault();
  event.stopPropagation();

  const selector = getElementSelector(event.target);
  const text = event.target.textContent.trim();

  await chrome.storage.local.set({
    pendingPickedRule: {
      name: text ? `Picked: ${text.slice(0, 40)}` : "Picked element",
      containerSelector: selector,
      textSelector: null
    }
  });

  showCopyToast(`Picked selector: ${selector}`);

  stopElementPicker();
}

function handlePickerKeyDown(event) {
  if (event.key === "Escape") {
    stopElementPicker();
    showCopyToast("Element picker cancelled");
  }
}

function startElementPicker() {
  pickerActive = true;

  document.addEventListener("mouseover", handlePickerMouseOver, true);
  document.addEventListener("click", handlePickerClick, true);
  document.addEventListener("keydown", handlePickerKeyDown, true);

  showCopyToast("Pick an element. Press Esc to cancel.");
}

let testerActive = false;
let testerRule = null;

function stopRuleTester() {
  testerActive = false;
  testerRule = null;

  if (highlightedElement) {
    highlightedElement.style.outline = "";
    highlightedElement = null;
  }

  document.removeEventListener("mouseover", handleTesterMouseOver, true);
  document.removeEventListener("click", handleTesterClick, true);
  document.removeEventListener("keydown", handleTesterKeyDown, true);
}

function handleTesterMouseOver(event) {
  if (!testerActive) return;

  event.preventDefault();
  event.stopPropagation();

  highlightElement(event.target);
}

function handleTesterClick(event) {
  if (!testerActive) return;

  event.preventDefault();
  event.stopPropagation();

  const result = extractTextResult(event.target, [testerRule]);
  const ruleName = testerRule.name;

  if (result.text) {
    showCopyToast(`Test match: "${result.text}" (rule: ${ruleName})`);
  } else {
    showCopyToast(`Test: No match for rule "${ruleName}"`);
  }

  stopRuleTester();
}

function handleTesterKeyDown(event) {
  if (event.key === "Escape") {
    stopRuleTester();
    showCopyToast("Rule test cancelled");
  }
}

function startRuleTester(rule) {
  testerActive = true;
  testerRule = rule;

  document.addEventListener("mouseover", handleTesterMouseOver, true);
  document.addEventListener("click", handleTesterClick, true);
  document.addEventListener("keydown", handleTesterKeyDown, true);

  showCopyToast(`Test mode: click an element to test rule "${rule.name}". Press Esc to cancel.`);
}

if (typeof module !== "undefined") {
  module.exports = {
    startElementPicker,
    stopElementPicker,
    highlightElement,
    startRuleTester,
    stopRuleTester
  };
}
