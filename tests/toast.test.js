const { JSDOM } = require("jsdom");
const { showCopyToast } = require("../src/shared/toast");

let document;

beforeEach(() => {
  jest.useFakeTimers();
  const dom = new JSDOM("<!DOCTYPE html><body></body>");
  document = dom.window.document;
  global.document = document;
});

afterEach(() => {
  jest.useRealTimers();
});

describe("showCopyToast", () => {
  test("appends a toast to the body", () => {
    showCopyToast("Hello");
    const toast = document.getElementById("copy-structured-text-toast");
    expect(toast).not.toBeNull();
    expect(toast.textContent).toBe("Hello");
  });

  test("replaces an existing toast instead of stacking", () => {
    showCopyToast("First");
    showCopyToast("Second");
    const toasts = document.querySelectorAll("#copy-structured-text-toast");
    expect(toasts.length).toBe(1);
    expect(toasts[0].textContent).toBe("Second");
  });

  test("toast is fixed-positioned in the top-right", () => {
    showCopyToast("Test");
    const toast = document.getElementById("copy-structured-text-toast");
    expect(toast.style.position).toBe("fixed");
    expect(toast.style.top).toBe("16px");
    expect(toast.style.right).toBe("16px");
  });
});
