import { useEffect, useState } from "react";
import api from "../api";

function StatCard({ label, value, color }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ fontSize: "0.72rem", color: "var(--muted)", fontFamily: "'Syne',sans-serif", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "'Syne',sans-serif", color: color || "var(--text)" }}>
        {value ?? "—"}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState("stats");
  const [stats, setStats] = useState(null);
  const [buyers, setBuyers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/admin/stats"),
      api.get("/admin/buyers"),
      api.get("/admin/sellers"),
      api.get("/admin/auctions"),
    ]).then(([s, b, se, a]) => {
      setStats(s.data);
      setBuyers(b.data);
      setSellers(se.data);
      setAuctions(a.data);
    }).finally(() => setLoading(false));
  }, []);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const toggleUser = async (type, id, isActive) => {
    const action = isActive ? "block" : "unblock";
    await api.post(`/admin/${type}/${id}/${action}`);
    const setter = type === "buyers" ? setBuyers : setSellers;
    setter((prev) => prev.map((u) => u.id === id ? { ...u, is_active: !isActive } : u));
    flash(`User ${action}ed successfully.`);
  };

  const closeAuction = async (id) => {
    await api.post(`/auctions/${id}/close`);
    setAuctions((prev) => prev.map((a) => a.id === id ? { ...a, status: "closed" } : a));
    flash("Auction closed.");
  };

  const TABS = ["stats", "buyers", "sellers", "auctions"];

  if (loading) return <div style={{ textAlign: "center", padding: 80, color: "var(--muted)" }}>Loading dashboard...</div>;

  return (
    <div className="page animate-fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 4 }}>Admin Dashboard</h1>
        <p style={{ color: "var(--muted)" }}>Platform overview and management</p>
      </div>

      {msg && <div className="msg-success" style={{ marginBottom: 20 }}>{msg}</div>}

      {/* Tab Bar */}
      <div style={{
        display: "flex", gap: 4, marginBottom: 28,
        background: "var(--surface)", borderRadius: 10, padding: 4,
        border: "1px solid var(--border)", width: "fit-content",
      }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "8px 20px", borderRadius: 7, border: "none", cursor: "pointer",
            fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "0.8rem",
            letterSpacing: "0.05em", textTransform: "uppercase", transition: "all 0.2s ease",
            background: tab === t ? "var(--amber)" : "transparent",
            color: tab === t ? "#000" : "var(--muted)",
          }}>{t}</button>
        ))}
      </div>

      {/* Stats */}
      {tab === "stats" && (
        <div className="animate-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
          <StatCard label="Total Buyers" value={stats?.total_buyers} color="var(--amber)" />
          <StatCard label="Total Sellers" value={stats?.total_sellers} color="var(--amber)" />
          <StatCard label="Total Products" value={stats?.total_products} />
          <StatCard label="Total Auctions" value={stats?.total_auctions} />
          <StatCard label="Active Auctions" value={stats?.active_auctions} color="var(--success)" />
          <StatCard label="Total Bids" value={stats?.total_bids} />
          <StatCard label="Blocked Buyers" value={stats?.blocked_buyers} color="var(--danger)" />
          <StatCard label="Blocked Sellers" value={stats?.blocked_sellers} color="var(--danger)" />
        </div>
      )}

      {/* Buyers Table */}
      {tab === "buyers" && (
        <div className="card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["ID", "Name", "Email", "Joined", "Status", "Action"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.72rem", color: "var(--muted)", fontFamily: "'Syne',sans-serif", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {buyers.map((b) => (
                <tr key={b.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 16px", color: "var(--muted)", fontSize: "0.82rem" }}>#{b.id}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 600 }}>{b.name}</td>
                  <td style={{ padding: "12px 16px", color: "var(--muted)", fontSize: "0.85rem" }}>{b.email}</td>
                  <td style={{ padding: "12px 16px", color: "var(--muted)", fontSize: "0.82rem" }}>{new Date(b.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span className={`badge ${b.is_active ? "badge-active" : "badge-closed"}`}>
                      {b.is_active ? "Active" : "Blocked"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button className={b.is_active ? "btn-danger" : "btn-ghost"}
                      style={{ padding: "5px 14px", fontSize: "0.78rem" }}
                      onClick={() => toggleUser("buyers", b.id, b.is_active)}>
                      {b.is_active ? "Block" : "Unblock"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sellers Table */}
      {tab === "sellers" && (
        <div className="card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["ID", "Name", "Email", "Joined", "Status", "Action"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.72rem", color: "var(--muted)", fontFamily: "'Syne',sans-serif", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sellers.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 16px", color: "var(--muted)", fontSize: "0.82rem" }}>#{s.id}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 600 }}>{s.name}</td>
                  <td style={{ padding: "12px 16px", color: "var(--muted)", fontSize: "0.85rem" }}>{s.email}</td>
                  <td style={{ padding: "12px 16px", color: "var(--muted)", fontSize: "0.82rem" }}>{new Date(s.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span className={`badge ${s.is_active ? "badge-active" : "badge-closed"}`}>
                      {s.is_active ? "Active" : "Blocked"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button className={s.is_active ? "btn-danger" : "btn-ghost"}
                      style={{ padding: "5px 14px", fontSize: "0.78rem" }}
                      onClick={() => toggleUser("sellers", s.id, s.is_active)}>
                      {s.is_active ? "Block" : "Unblock"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Auctions Table */}
      {tab === "auctions" && (
        <div className="card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["ID", "Product", "Seller", "Status", "Current Price", "Bids", "Action"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.72rem", color: "var(--muted)", fontFamily: "'Syne',sans-serif", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {auctions.map((a) => (
                <tr key={a.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 16px", color: "var(--muted)", fontSize: "0.82rem" }}>#{a.id}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 600, maxWidth: 200 }}>{a.product_title}</td>
                  <td style={{ padding: "12px 16px", color: "var(--muted)", fontSize: "0.85rem" }}>{a.seller_name}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span className={`badge badge-${a.status}`}>{a.status}</span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--amber)", fontWeight: 700, fontFamily: "'Syne',sans-serif" }}>
                    ${a.current_price?.toLocaleString()}
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--muted)" }}>{a.bid_count}</td>
                  <td style={{ padding: "12px 16px" }}>
                    {a.status === "active" && (
                      <button className="btn-danger" style={{ padding: "5px 14px", fontSize: "0.78rem" }}
                        onClick={() => closeAuction(a.id)}>
                        Close
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}