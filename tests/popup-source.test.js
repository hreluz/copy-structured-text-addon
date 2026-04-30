const fs = require("fs");
const path = require("path");

describe("popup.js picker and cancel behavior", () => {
  let source;

  beforeAll(() => {
    source = fs.readFileSync(path.resolve(__dirname, "../src/popup.js"), "utf-8");
  });

  test("sets cancel text to Cancel Edit in edit mode", () => {
    expect(source).toContain('cancelEditButton.textContent = "Cancel Edit"');
  });

  test("sets cancel text to Discard Pick in picker mode", () => {
    expect(source).toContain('cancelEditButton.textContent = "Discard Pick"');
  });

  test("sets submit button to Add Picked Rule", () => {
    expect(source).toContain('submitButton.textContent = "Add Picked Rule"');
  });

  test("picker mode does not set edit index", () => {
    expect(source).toContain('editIndexInput.value = ""');
  });

  test("cancel removes pending picked rule", () => {
    expect(source).toContain('chrome.storage.local.remove(["pendingPickedRule"])');
  });
});
