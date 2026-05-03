import { createPortal } from "react-dom";

export default function ConfirmationDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText  = "Cancel",
  isLoading   = false,
  isDangerous = false,
}) {
  if (!isOpen) return null;

  return createPortal(
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "0 16px",
      backdropFilter: "blur(2px)",
      animation: "fadeIn 0.15s ease forwards",
    }}>
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border-strong)",
        borderRadius: 2,
        width: "100%", maxWidth: 420,
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        animation: "fadeUp 0.2s ease forwards",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface-2)",
        }}>
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900, fontSize: "1.1rem",
            textTransform: "uppercase", letterSpacing: "0.04em",
            color: isDangerous ? "var(--danger)" : "var(--text)",
            margin: 0,
          }}>{title}</h2>
        </div>

        {/* Body */}
        <div style={{ padding: "20px" }}>
          <p style={{
            color: "var(--text-2)", fontSize: "0.88rem",
            lineHeight: 1.7, margin: 0,
          }}>{message}</p>
        </div>

        {/* Actions */}
        <div style={{
          display: "flex", justifyContent: "flex-end", gap: 10,
          padding: "14px 20px",
          borderTop: "1px solid var(--border)",
        }}>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="btn-ghost"
            style={{ padding: "8px 20px", fontSize: "0.8rem" }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={isDangerous ? "btn-danger" : "btn-primary"}
            style={{ padding: "8px 20px", fontSize: "0.8rem" }}
          >
            {isLoading ? "Loading..." : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
