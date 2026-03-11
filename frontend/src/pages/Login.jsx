import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import useAuthStore from "../store/authStore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.access_token, data.role, { email });
      // Auto-redirect based on role
      navigate(data.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 64px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
      background: "radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.06) 0%, transparent 60%)",
    }}>
      <div className="animate-fade-up" style={{ width: "100%", maxWidth: 400 }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🏷️</div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 8 }}>Welcome back</h1>
          <p style={{ color: "var(--muted)" }}>Sign in to continue to BidVault</p>
        </div>

        <div className="card" style={{ padding: 28 }}>
          {error && <div className="msg-error" style={{ marginBottom: 20 }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label>Email</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              className="btn-primary"
              type="submit"
              disabled={loading}
              style={{ width: "100%", justifyContent: "center", marginTop: 4, padding: "12px" }}
            >
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, color: "var(--muted)", fontSize: "0.875rem" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--amber)", textDecoration: "none", fontWeight: 600 }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}