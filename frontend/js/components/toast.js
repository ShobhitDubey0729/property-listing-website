/**
 * PropLease Toast Notification Utility
 */

const Toast = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.className = "toast-container";
      document.body.appendChild(this.container);
    }
  },

  show(message, type = "info", duration = 3500) {
    this.init();

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let icon = "ℹ️";
    if (type === "success") icon = "✅";
    if (type === "warning") icon = "⚠️";
    if (type === "danger") icon = "🚨";

    toast.innerHTML = `
      <span style="font-size: 1.15rem; flex-shrink: 0;">${icon}</span>
      <div style="font-size: 0.88rem; line-height: 1.35; color: var(--text-main); font-weight: 500;">
        ${message}
      </div>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "toastFadeOut 0.3s ease forwards";
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  },

  success(msg) { this.show(msg, "success"); },
  info(msg) { this.show(msg, "info"); },
  warning(msg) { this.show(msg, "warning"); },
  danger(msg) { this.show(msg, "danger"); }
};

window.Toast = Toast;
