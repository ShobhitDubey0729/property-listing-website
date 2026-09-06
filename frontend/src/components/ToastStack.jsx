import { useUi } from "../context/UiContext.jsx";

export function ToastStack() {
  const { toasts } = useUi();
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map((t) => {
        let icon = "ℹ️";
        if (t.type === "success") icon = "✅";
        if (t.type === "warning") icon = "⚠️";
        if (t.type === "danger") icon = "🚨";
        return (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span style={{ fontSize: "1.15rem", flexShrink: 0 }}>{icon}</span>
            <div style={{ fontSize: "0.88rem", lineHeight: 1.35, color: "var(--text-main)", fontWeight: 500 }}>
              {t.message}
            </div>
          </div>
        );
      })}
    </div>
  );
}
