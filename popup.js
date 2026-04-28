const form = document.getElementById("rule-form");
const rulesList = document.getElementById("rules-list");

async function getCustomRules() {
  const result = await chrome.storage.local.get(["customRules"]);
  return result.customRules || [];
}

async function saveCustomRules(rules) {
  await chrome.storage.local.set({
    customRules: rules
  });
}

async function renderRules() {
  const rules = await getCustomRules();

  rulesList.innerHTML = "";

  if (rules.length === 0) {
    rulesList.innerHTML = "<li>No custom rules yet.</li>";
    return;
  }

  rules.forEach((rule, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div class="rule-name">${rule.name}</div>
      <div>Container: <code>${rule.containerSelector}</code></div>
      <div>Text: <code>${rule.textSelector || "container text"}</code></div>
      <button class="delete-btn" data-index="${index}">Delete</button>
    `;

    rulesList.appendChild(li);
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const containerSelector = document.getElementById("containerSelector").value.trim();
  const textSelector = document.getElementById("textSelector").value.trim() || null;

  const rules = await getCustomRules();

  rules.unshift({
    name,
    containerSelector,
    textSelector
  });

  await saveCustomRules(rules);

  form.reset();
  renderRules();
});

rulesList.addEventListener("click", async (event) => {
  if (!event.target.classList.contains("delete-btn")) return;

  const index = Number(event.target.dataset.index);
  const rules = await getCustomRules();

  rules.splice(index, 1);

  await saveCustomRules(rules);
  renderRules();
});

renderRules();