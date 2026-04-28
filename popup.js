const form = document.getElementById("rule-form");
const rulesList = document.getElementById("rules-list");
const mergedRulesList = document.getElementById("merged-rules-list");
const lastMatch = document.getElementById("last-match");

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
    const response = await fetch(chrome.runtime.getURL("copyRules.json"));

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
  cancelEditButton.classList.add("hidden");
}

function enterEditMode(rule, index) {
  editIndexInput.value = String(index);
  nameInput.value = rule.name;
  containerSelectorInput.value = rule.containerSelector;
  textSelectorInput.value = rule.textSelector || "";

  submitButton.textContent = "Update Rule";
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

cancelEditButton.addEventListener("click", () => {
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

renderRules();
