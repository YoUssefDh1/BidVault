import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import useAuthStore from "../store/authStore";

export default function AuthNudge({ onLogin, onRegister }) {
  const { token } = useAuthStore();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Show after 4 seconds if not logged in and not dismissed
  useEffect(() => {
    if (token || dismissed) return;
    const timer = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(timer);
  }, [token, dismissed]);

  // Hide if user logs in
  useEffect(() => {
    if (token) setVisible(false);
  }, [token]);

  const dismiss = () => {
    setVisible(false);
    setDismissed(true);
  };

  if (!visible || token) return null;

  return createPortal(
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 500,
      width: 300,
      background: "var(--surface)",
      border: "1px solid var(--border-2)",
      borderRadius: 4,
      boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
      overflow: "hidden",
      animation: "slideUp 0.35s cubic-bezier(0.16,1,0.3,1) forwards",
    }}>

      {/* Lime top accent bar */}
      <div style={{ height: 3, background: "var(--primary)", width: "100%" }} />

      <div style={{ padding: "16px 18px 18px" }}>

        {/* Header row */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", marginBottom: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "1.2rem" }}>👋</span>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900, fontSize: "1rem",
              letterSpacing: "0.04em", textTransform: "uppercase",
              color: "var(--text)",
            }}>New here?</span>
          </div>
          <button onClick={dismiss} style={{
            background: "transparent", border: "none",
            color: "var(--muted)", cursor: "pointer",
            fontSize: "0.8rem", lineHeight: 1,
            padding: 2, marginTop: 1,
            transition: "color 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--muted)"}
          >✕</button>
        </div>

        <p style={{
          fontSize: "0.8rem", color: "var(--muted)",
          lineHeight: 1.6, marginBottom: 16,
        }}>
          Create a free account to place bids, list your items, and track live auctions in real time.
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { dismiss(); onRegister(); }}
            className="btn-primary"
            style={{ flex: 1, justifyContent: "center", fontSize: "0.78rem", padding: "9px 0" }}>
            Create Account
          </button>
          <button onClick={() => { dismiss(); onLogin(); }}
            className="btn-ghost"
            style={{ flex: 1, justifyContent: "center", fontSize: "0.78rem", padding: "9px 0" }}>
            Sign In
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}