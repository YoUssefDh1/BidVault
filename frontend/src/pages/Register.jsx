import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import useAuthStore from "../store/authStore";

export default function Register() {
  const [name, setName] = useState("");
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
      await api.post("/auth/register", { name, email, password });
      const { data } = await api.post("/auth/login", { email, password });
      login(data.access_token, data.role, { name, email });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed.");
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
          <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 8 }}>Create account</h1>
          <p style={{ color: "var(--muted)" }}>One account to buy and sell on BidVault</p>
        </div>

        {/* Info banner */}
        <div style={{
          padding: "12px 16px", marginBottom: 20,
          background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: 8, fontSize: "0.82rem", color: "var(--muted)", textAlign: "center",
        }}>
          🛒 Bid on items &nbsp;·&nbsp; 🏷️ List your own products &nbsp;·&nbsp; all with one account
        </div>

        <div className="card" style={{ padding: 28 }}>
          {error && <div className="msg-error" style={{ marginBottom: 20 }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label>Full Name</label>
              <input className="input" placeholder="John Doe"
                value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label>Email</label>
              <input className="input" type="email" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label>Password</label>
              <input className="input" type="password" placeholder="Min. 6 characters"
                value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <button className="btn-primary" type="submit" disabled={loading}
              style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, color: "var(--muted)", fontSize: "0.875rem" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--amber)", textDecoration: "none", fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}