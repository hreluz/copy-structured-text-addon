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

if (typeof module !== "undefined") {
  module.exports = {
    startElementPicker,
    stopElementPicker,
    highlightElement
  };
}
