import { useEffect, useState } from "react";
import api from "../api";
import BackToHome from "../components/BackToHome";
import ConfirmationDialog from "../components/ConfirmationDialog";

const Label = ({ children }) => (
  <div style={{
    fontSize: "0.65rem", color: "var(--muted)",
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: "0.12em", textTransform: "uppercase",
    fontWeight: 700, marginBottom: 6,
  }}>{children}</div>
);

function StatCard({ label, value, accent }) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      padding: "20px 24px", display: "flex", flexDirection: "column", gap: 8,
    }}>
      <Label>{label}</Label>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 900, fontSize: "2.2rem",
        color: accent ? "var(--primary)" : "var(--text)", lineHeight: 1,
      }}>{value}</div>
    </div>
  );
}

function Table({ columns, rows, actions }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {columns.map((col) => (
              <th key={col} style={{
                padding: "10px 16px", textAlign: "left",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "0.65rem", fontWeight: 700,
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: "var(--muted)",
              }}>{col}</th>
            ))}
            {actions && <th style={{ padding: "10px 16px" }} />}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{
              borderBottom: "1px solid var(--border)",
              transition: "background 0.1s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {row.map((cell, j) => (
                <td key={j} style={{
                  padding: "12px 16px", fontSize: "0.85rem", color: "var(--text-2)",
                }}>{cell}</td>
              ))}
              {actions && (
                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  {actions(i)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminDashboard() {
  const [tab, setTab]         = useState("overview");
  const [stats, setStats]     = useState(null);
  const [users, setUsers]     = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedAuctionId, setSelectedAuctionId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/admin/stats").then(({ data }) => setStats(data)),
      api.get("/admin/users").then(({ data }) => setUsers(data)),
      api.get("/admin/auctions").then(({ data }) => setAuctions(data)),
    ]).catch((err) => {
      setError(err.response?.data?.detail || "Failed to load dashboard data.");
    }).finally(() => setLoading(false));
  }, []);

  const confirmBlockUser = (id, blocked) => {
    setSelectedUserId(id);
    setDialogType(blocked ? "unblock" : "block");
    setDialogOpen(true);
  };

  const blockUser = async (id, blocked) => {
    setActionLoading(true);
    try {
      await api.post(`/admin/users/${id}/${blocked ? "unblock" : "block"}`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: blocked } : u));
      setDialogOpen(false);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update user.");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmCloseAuction = (id) => {
    setSelectedAuctionId(id);
    setDialogType("closeAuction");
    setDialogOpen(true);
  };

  const closeAuction = async (id) => {
    setActionLoading(true);
    try {
      await api.post(`/auctions/${id}/close`);
      setAuctions(prev => prev.map(a => a.id === id ? { ...a, status: "closed" } : a));
      setDialogOpen(false);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to close auction.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmAction = () => {
    if (dialogType === "block") blockUser(selectedUserId, false);
    else if (dialogType === "unblock") blockUser(selectedUserId, true);
    else if (dialogType === "closeAuction") closeAuction(selectedAuctionId);
  };

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "users",    label: "Users",    count: users.length },
    { key: "auctions", label: "Auctions", count: auctions.length },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "48px 32px" }}>
        <BackToHome />

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          fontSize: "0.68rem", color: "var(--primary)",
          fontFamily: "'Barlow Condensed', sans-serif",
          letterSpacing: "0.15em", textTransform: "uppercase",
          fontWeight: 700, marginBottom: 6,
        }}>Admin Panel</div>
        <h1 style={{ fontSize: "2.4rem", fontWeight: 900 }}>Dashboard</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 36 }}>
        {tabs.map(({ key, label, count }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            background: "transparent", border: "none", cursor: "pointer",
            padding: "10px 24px",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700, fontSize: "0.88rem",
            letterSpacing: "0.08em", textTransform: "uppercase",
            color: tab === key ? "var(--primary)" : "var(--muted)",
            borderBottom: tab === key ? "2px solid var(--primary)" : "2px solid transparent",
            transition: "all 0.15s", display: "flex", alignItems: "center", gap: 8,
          }}>
            {label}
            {count !== undefined && (
              <span style={{
                background: tab === key ? "rgba(136,192,208,0.15)" : "var(--surface-2)",
                color: tab === key ? "var(--primary)" : "var(--muted)",
                fontSize: "0.7rem", fontWeight: 800,
                padding: "1px 7px", borderRadius: 10,
              }}>{count}</span>
            )}
          </button>
        ))}
      </div>

      {error ? (
        <div className="msg-error">{error}</div>
      ) : loading ? (
        <div style={{ color: "var(--muted)", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Loading...
        </div>
      ) : (
        <>
          {/* ── OVERVIEW ── */}
          {tab === "overview" && stats && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, marginBottom: 1 }}>
                <StatCard label="Total Users"    value={stats.total_users}    accent />
                <StatCard label="Total Products" value={stats.total_products} />
                <StatCard label="Total Auctions" value={stats.total_auctions} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
                <StatCard label="Active Auctions" value={stats.active_auctions} accent />
                <StatCard label="Total Bids"      value={stats.total_bids} />
                <StatCard label="Blocked Users"   value={stats.blocked_users} />
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {tab === "users" && (
            <div>
              <Table
                columns={["Name", "Email", "Status", "Joined"]}
                rows={users.map(u => [
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>{u.name}</span>,
                  u.email,
                  <span className={`badge ${u.is_active ? "badge-active" : "badge-closed"}`}>
                    {u.is_active ? "Active" : "Blocked"}
                  </span>,
                  new Date(u.created_at).toLocaleDateString(),
                ])}
                actions={(i) => (
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button
                      onClick={() => confirmBlockUser(users[i].id, !users[i].is_active)}
                      className={users[i].is_active ? "btn-danger" : "btn-ghost"}
                      style={{ padding: "5px 14px", fontSize: "0.75rem" }}>
                      {users[i].is_active ? "Block" : "Unblock"}
                    </button>
                  </div>
                )}
              />
            </div>
          )}

          {/* ── AUCTIONS ── */}
          {tab === "auctions" && (
            <div>
              <Table
                columns={["Product", "Seller", "Status", "Price", "Bids", "Winner"]}
                rows={auctions.map(a => [
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>{a.product_title}</span>,
                  a.seller_name,
                  <span className={`badge badge-${a.status}`}>{a.status}</span>,
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, color: "var(--primary)" }}>
                    ${a.current_price?.toLocaleString()}
                  </span>,
                  a.bid_count,
                  a.winner || <span style={{ color: "var(--muted)" }}>—</span>,
                ])}
                actions={(i) => (
                  auctions[i].status === "active" && (
                    <button onClick={() => confirmCloseAuction(auctions[i].id)}
                      className="btn-danger"
                      style={{ padding: "5px 14px", fontSize: "0.75rem" }}>
                      Close
                    </button>
                  )
                )}
              />
            </div>
          )}
        </>
      )}

      <ConfirmationDialog
        isOpen={dialogOpen}
        title={dialogType === "block" ? "Block User" : dialogType === "unblock" ? "Unblock User" : "Close Auction"}
        message={
          dialogType === "block" ? "Are you sure you want to block this user? They won't be able to use the platform."
          : dialogType === "unblock" ? "Are you sure you want to unblock this user? They will be able to use the platform again."
          : "Are you sure you want to close this auction? This action cannot be undone."
        }
        onConfirm={handleConfirmAction}
        onCancel={() => setDialogOpen(false)}
        confirmText={dialogType === "block" ? "Block" : dialogType === "unblock" ? "Unblock" : "Close Auction"}
        isDangerous={true}
        isLoading={actionLoading}
      />
    </div>
  );
}