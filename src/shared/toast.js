function showCopyToast(message) {
  const existingToast = document.getElementById("copy-structured-text-toast");

  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.id = "copy-structured-text-toast";
  toast.textContent = message;

  toast.style.position = "fixed";
  toast.style.top = "16px";
  toast.style.right = "16px";
  toast.style.zIndex = "999999";
  toast.style.padding = "10px 14px";
  toast.style.background = "#111";
  toast.style.color = "#fff";
  toast.style.borderRadius = "6px";
  toast.style.fontSize = "13px";
  toast.style.fontFamily = "Arial, sans-serif";
  toast.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.25)";

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2500);
}

if (typeof module !== "undefined") {
  module.exports = { showCopyToast };
}
