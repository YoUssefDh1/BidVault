import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import api from "../api";
import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";

export default function AuthModal({ mode, onClose }) {
  const [tab, setTab]           = useState(mode);
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const { login } = useAuthStore();
  const navigate  = useNavigate();

  useEffect(() => { setTab(mode); setError(""); }, [mode]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, []);

  const reset = () => { setName(""); setEmail(""); setPassword(""); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (tab === "register") {
        await api.post("/auth/register", { name, email, password });
        const { data } = await api.post("/auth/login", { email, password });
        login(data.access_token, data.role, { name, email });
        onClose();
      } else {
        const { data } = await api.post("/auth/login", { email, password });
        // Fetch full user info so we have the name
        const meRes = await fetch("http://localhost:8000/users/me", {
          headers: { Authorization: `Bearer ${data.access_token}` },
        });
        const me = meRes.ok ? await meRes.json() : { email };
        login(data.access_token, data.role, me);
        onClose();
        if (data.role === "admin") navigate("/admin");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
        animation: "fadeIn 0.15s ease",
      }} />

      {/* Centering wrapper */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 1001,
        padding: "0 16px",
        display: "flex", alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}>

        {/* Animation wrapper */}
        <div style={{
          width: "100%", maxWidth: 420,
          pointerEvents: "auto",
          animation: "fadeUp 0.22s cubic-bezier(0.16,1,0.3,1) forwards",
        }}>

          {/* Card */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border-2)",
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
          }}>

            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "18px 24px",
              borderBottom: "1px solid var(--border)",
              background: "var(--surface-2)",
            }}>
              <div style={{ display: "flex", gap: 4 }}>
                {["login", "register"].map((t) => (
                  <button key={t} onClick={() => { setTab(t); reset(); }} style={{
                    background: "transparent", border: "none", cursor: "pointer",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 800, fontSize: "1rem",
                    letterSpacing: "0.06em", textTransform: "uppercase",
                    color: tab === t ? "var(--lime)" : "var(--muted)",
                    borderBottom: tab === t ? "2px solid var(--lime)" : "2px solid transparent",
                    paddingBottom: 2, paddingLeft: 0, paddingRight: 16,
                    transition: "all 0.15s",
                  }}>
                    {t === "login" ? "Sign In" : "Register"}
                  </button>
                ))}
              </div>
              <button onClick={onClose} style={{
                background: "transparent", border: "1px solid var(--border)",
                color: "var(--muted)", cursor: "pointer",
                width: 28, height: 28, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.9rem", transition: "all 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--text)"; e.currentTarget.style.color = "var(--text)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}
              >✕</button>
            </div>

            {/* Body */}
            <div style={{ padding: "28px 24px" }}>
              {error && (
                <div className="msg-error" style={{ marginBottom: 20 }}>{error}</div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {tab === "register" && (
                  <div>
                    <label>Full Name</label>
                    <input className="input" placeholder="John Doe"
                      value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                )}
                <div>
                  <label>Email</label>
                  <input className="input" type="email" placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div>
                  <label>Password</label>
                  <input className="input" type="password"
                    placeholder={tab === "register" ? "Min. 6 characters" : "••••••••"}
                    value={password} onChange={e => setPassword(e.target.value)}
                    required minLength={tab === "register" ? 6 : undefined} />
                </div>
                <button className="btn-primary" type="submit" disabled={loading} style={{
                  width: "100%", justifyContent: "center",
                  padding: "13px", fontSize: "0.9rem", marginTop: 4,
                }}>
                  {loading
                    ? "Please wait..."
                    : tab === "login" ? "Sign In →" : "Create Account →"}
                </button>
              </form>

              <p style={{
                marginTop: 20, textAlign: "center",
                fontSize: "0.82rem", color: "var(--muted)",
              }}>
                {tab === "login" ? "Don't have an account? " : "Already have an account? "}
                <span
                  onClick={() => { setTab(tab === "login" ? "register" : "login"); reset(); }}
                  style={{ color: "var(--lime)", cursor: "pointer", fontWeight: 600 }}
                >
                  {tab === "login" ? "Register" : "Sign In"}
                </span>
              </p>
            </div>

          </div>
        </div>
      </div>
    </>,
    document.body
  );
}