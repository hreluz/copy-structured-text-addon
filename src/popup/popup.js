const form = document.getElementById("rule-form");
const rulesList = document.getElementById("rules-list");
const mergedRulesList = document.getElementById("merged-rules-list");
const lastMatch = document.getElementById("last-match");

const pickElementButton = document.getElementById("pickElementButton");

const exportRulesButton = document.getElementById("exportRulesButton");
const importRulesInput = document.getElementById("importRulesInput");

const editIndexInput = document.getElementById("editIndex");
const nameInput = document.getElementById("name");
const containerSelectorInput = document.getElementById("containerSelector");
const textSelectorInput = document.getElementById("textSelector");

const submitButton = document.getElementById("submitButton");
const cancelEditButton = document.getElementById("cancelEditButton");

async function getCustomRules() {
  const result = await chrome.storage.local.get(["customRules"]);
  return result.customRules || [];
}

async function saveCustomRules(rules) {
  await chrome.storage.local.set({
    customRules: rules
  });
}

async function getFileRules() {
  try {
    const response = await fetch(chrome.runtime.getURL("src/copyRules.json"));

    if (!response.ok) {
      return [];
    }

    return await response.json();
  } catch {
    return [];
  }
}

function resetForm() {
  form.reset();
  editIndexInput.value = "";
  submitButton.textContent = "Add Rule";
  cancelEditButton.textContent = "Cancel";
  cancelEditButton.classList.add("hidden");
}

function enterEditMode(rule, index) {
  editIndexInput.value = String(index);
  nameInput.value = rule.name;
  containerSelectorInput.value = rule.containerSelector;
  textSelectorInput.value = rule.textSelector || "";

  submitButton.textContent = "Update Rule";
  cancelEditButton.textContent = "Cancel Edit";
  cancelEditButton.classList.remove("hidden");
}

function renderRuleItem(rule, source) {
  const li = document.createElement("li");

  li.innerHTML = `
    <div class="rule-name">${rule.name} <span class="source">(${source})</span></div>
    <div>Container: <code>${rule.containerSelector}</code></div>
    <div>Text: <code>${rule.textSelector || "container text"}</code></div>
  `;

  return li;
}

async function renderMergedRules() {
  const uiRules = await getCustomRules();
  const fileRules = await getFileRules();
  const mergedRules = mergeRules(uiRules, fileRules, DEFAULT_RULES);

  mergedRulesList.innerHTML = "";

  if (mergedRules.length === 0) {
    mergedRulesList.innerHTML = "<li>No rules available.</li>";
    return;
  }

  mergedRules.forEach((rule) => {
    let source = "Default";

    if (uiRules.includes(rule)) {
      source = "UI";
    } else if (fileRules.includes(rule)) {
      source = "JSON";
    }

    mergedRulesList.appendChild(renderRuleItem(rule, source));
  });
}

async function renderRules() {
  const rules = await getCustomRules();

  rulesList.innerHTML = "";

  if (rules.length === 0) {
    rulesList.innerHTML = "<li>No custom rules yet.</li>";
  } else {
    rules.forEach((rule, index) => {
      const li = document.createElement("li");

      li.innerHTML = `
        <div class="rule-name">${rule.name}</div>
        <div>Container: <code>${rule.containerSelector}</code></div>
        <div>Text: <code>${rule.textSelector || "container text"}</code></div>

        <div class="rule-actions">
          <button class="edit-btn" data-index="${index}">Edit</button>
          <button class="delete-btn" data-index="${index}">Delete</button>
        </div>
      `;

      rulesList.appendChild(li);
    });
  }

  await renderMergedRules();
  await renderLastMatch();
}

function downloadJson(filename, data) {
  const blob = new Blob([globalThis.serializeRules(data)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

function readJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        resolve(globalThis.parseRulesJson(reader.result));
      } catch {
        reject(new Error("Invalid JSON file."));
      }
    };

    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsText(file);
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const rule = {
    name: nameInput.value.trim(),
    containerSelector: containerSelectorInput.value.trim(),
    textSelector: textSelectorInput.value.trim() || null
  };

  const validation = validateRule(rule);

  if (!validation.isValid) {
    alert(validation.errors.join("\n"));
    return;
  }

  const rules = await getCustomRules();
  const editIndex = editIndexInput.value;

  let updatedRules;

  if (editIndex !== "") {
    updatedRules = updateRule(rules, Number(editIndex), rule);
  } else {
    updatedRules = addRule(rules, rule);
  }

  await saveCustomRules(updatedRules);

  resetForm();
  renderRules();
});

rulesList.addEventListener("click", async (event) => {
  const target = event.target;

  if (target.classList.contains("edit-btn")) {
    const index = Number(target.dataset.index);
    const rules = await getCustomRules();

    enterEditMode(rules[index], index);
    return;
  }

  if (target.classList.contains("delete-btn")) {
    const index = Number(target.dataset.index);
    const rules = await getCustomRules();

    const updatedRules = deleteRule(rules, index);

    await saveCustomRules(updatedRules);
    resetForm();
    renderRules();
  }
});

cancelEditButton.addEventListener("click", async () => {
  await chrome.storage.local.remove(["pendingPickedRule"]);
  resetForm();
});

async function renderLastMatch() {
  const result = await chrome.storage.local.get(["lastMatchedRule"]);
  const lastMatchedRule = result.lastMatchedRule;

  if (!lastMatchedRule) {
    lastMatch.textContent = "No copied rule yet.";
    return;
  }

  lastMatch.innerHTML = `
    <div><strong>Rule:</strong> ${lastMatchedRule.ruleName || "Unknown"}</div>
    <div><strong>Text:</strong> <code>${lastMatchedRule.text}</code></div>
    <div><strong>Copied at:</strong> ${lastMatchedRule.copiedAt}</div>
  `;
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") {
    return;
  }

  if (changes.lastMatchedRule) {
    renderLastMatch();
  }

  if (changes.customRules) {
    renderRules(); // keep UI in sync
  }
});
exportRulesButton.addEventListener("click", async () => {
  const rules = await getCustomRules();
  downloadJson("copy-structured-text-rules.json", rules);
});

importRulesInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];

  if (!file) return;

  try {
    const importedRules = await readJsonFile(file);

    if (!Array.isArray(importedRules)) {
      alert("Invalid rules file. Expected a JSON array.");
      return;
    }

    for (const rule of importedRules) {
      const validation = validateRule(rule);

      if (!validation.isValid) {
        alert(`Invalid rule "${rule.name || "Unnamed"}":\n${validation.errors.join("\n")}`);
        return;
      }
    }

    await saveCustomRules(importedRules);

    resetForm();
    renderRules();
    alert("Rules imported successfully.");
  } catch (error) {
    alert(error.message);
  } finally {
    importRulesInput.value = "";
  }
});

pickElementButton.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  if (!tab?.id) {
    alert("No active tab found.");
    return;
  }

  await chrome.tabs.sendMessage(tab.id, {
    type: "START_ELEMENT_PICKER"
  });

  window.close();
});

async function loadPendingPickedRule() {
  const result = await chrome.storage.local.get(["pendingPickedRule"]);
  const rule = result.pendingPickedRule;

  if (!rule) return;

  nameInput.value = rule.name;
  containerSelectorInput.value = rule.containerSelector;
  textSelectorInput.value = rule.textSelector || "";

  submitButton.textContent = "Add Picked Rule";
  cancelEditButton.textContent = "Discard Pick";
  cancelEditButton.classList.remove("hidden");

  await chrome.storage.local.remove(["pendingPickedRule"]);
}

loadPendingPickedRule();
renderRules();
