import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api";
import useAuthStore from "../store/authStore";

export default function Profile() {
  const { user, role, login } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "account";
  const setTab = (t) => setSearchParams({ tab: t });

  const [bids, setBids]         = useState([]);
  const [products, setProducts] = useState([]);
  const [wins, setWins]         = useState([]);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/bids/mine").then(({ data }) => setBids(data)),
      api.get("/products/seller/mine").then(({ data }) => setProducts(data)),
      api.get("/users/me/wins").then(({ data }) => setWins(data)),
      api.get("/users/me/stats").then(({ data }) => setStats(data)),
    ]).finally(() => setLoading(false));
  }, []);

  const navItems = [
    { key: "account",  label: "Account" },
    { key: "bids",     label: "My Bids",       count: bids.length },
    { key: "listings", label: "My Listings",    count: products.length },
    { key: "wins",     label: "Won Auctions",   count: wins.length },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "48px 32px" }}>

      {/* ── Hello heading ── */}
      <h1 style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: "clamp(2.4rem, 5vw, 4rem)",
        fontWeight: 900, marginBottom: 8, lineHeight: 1,
      }}>
        Hello{" "}
        <span style={{ color: "var(--lime)" }}>{user?.name?.split(" ")[0]}</span>
      </h1>

      {/* Stats row */}
      {stats && (
        <div style={{ display: "flex", gap: 32, marginBottom: 32, marginTop: 16 }}>
          {[
            { label: "Bids Placed",  value: stats.total_bids },
            { label: "Listings",     value: stats.total_listings },
            { label: "Auctions Won", value: stats.total_wins },
            { label: "Total Spent",  value: `$${stats.total_spent?.toLocaleString()}` },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900, fontSize: "1.5rem", color: "var(--lime)",
              }}>{value}</span>
              <span style={{ fontSize: "0.78rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Barlow Condensed', sans-serif" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ height: 1, background: "var(--border)", marginBottom: 40 }} />

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 64 }}>

        {/* ── Sidebar nav ── */}
        <div>
          {navItems.map(({ key, label, count }) => {
            const active = tab === key;
            return (
              <div key={key} onClick={() => setTab(key)} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 0 10px 14px",
                borderLeft: active ? "2px solid var(--lime)" : "2px solid transparent",
                cursor: "pointer", transition: "all 0.15s",
                marginBottom: 4,
              }}>
                <span style={{
                  fontSize: "0.95rem", fontWeight: active ? 700 : 400,
                  color: active ? "var(--text)" : "var(--muted)",
                  transition: "color 0.15s",
                }}>{label}</span>
                {count !== undefined && count > 0 && (
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: "var(--lime)", flexShrink: 0,
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Content ── */}
        <div>
          {loading ? (
            <div style={{ color: "var(--muted)", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Loading...
            </div>
          ) : (
            <>
              {tab === "account" && <AccountTab user={user} login={login} />}
              {tab === "bids"     && <BidsTab bids={bids} />}
              {tab === "listings" && <ListingsTab products={products} />}
              {tab === "wins"     && <WinsTab wins={wins} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Field row with inline Change toggle ───────────────────────
function FieldRow({ label, value, hint, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ paddingBottom: 28, marginBottom: 28, borderBottom: "1px solid var(--border)" }}>
      <div style={{
        fontSize: "0.65rem", color: "var(--muted)",
        fontFamily: "'Barlow Condensed', sans-serif",
        letterSpacing: "0.12em", textTransform: "uppercase",
        fontWeight: 700, marginBottom: 6,
      }}>{label}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
        <div>
          <div style={{ fontSize: "1rem", fontWeight: 600, marginBottom: children ? 8 : 0 }}>{value}</div>
          {children && !open && (
            <span onClick={() => setOpen(true)} style={{
              fontSize: "0.82rem", color: "var(--lime)",
              cursor: "pointer", fontWeight: 600,
              borderBottom: "1px solid rgba(200,255,0,0.3)",
            }}>Change</span>
          )}
          {open && (
            <div style={{ marginTop: 12 }}>
              {children}
              <span onClick={() => setOpen(false)} style={{
                fontSize: "0.78rem", color: "var(--muted)", cursor: "pointer", marginTop: 8, display: "block",
              }}>Cancel</span>
            </div>
          )}
        </div>
        {hint && !open && (
          <div style={{ fontSize: "0.78rem", color: "var(--muted)", maxWidth: 260, lineHeight: 1.6, flexShrink: 0 }}>
            {hint}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Account Tab ───────────────────────────────────────────────
function AccountTab({ user, login }) {
  const [name, setName]         = useState(user?.name || "");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw]       = useState("");
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [saving, setSaving]     = useState(false);

  const save = async (payload) => {
    setError(""); setSaving(true);
    try {
      const { data } = await api.put("/users/me", payload);
      login(data.access_token, data.role, { ...user, name: payload.name || user?.name });
      setSuccess("Saved!"); setTimeout(() => setSuccess(""), 2500);
      setCurrentPw(""); setNewPw("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save.");
    } finally { setSaving(false); }
  };

  return (
    <div>
      <h2 style={{ fontSize: "1.6rem", fontWeight: 900, marginBottom: 28 }}>Account</h2>
      {error   && <div className="msg-error"   style={{ marginBottom: 16 }}>{error}</div>}
      {success && <div className="msg-success" style={{ marginBottom: 16 }}>{success}</div>}

      <FieldRow label="Name" value={user?.name}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input className="input" value={name} onChange={e => setName(e.target.value)}
            style={{ maxWidth: 280 }} />
          <button className="btn-primary" onClick={() => save({ name })} disabled={saving}
            style={{ padding: "9px 20px", fontSize: "0.82rem", whiteSpace: "nowrap" }}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </FieldRow>

      <FieldRow label="Email" value={user?.email}
        hint="Your email is used for login and notifications." />

      <FieldRow label="Password" value="••••••••"
        hint="Use a strong password with at least 6 characters.">
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 320 }}>
          <input className="input" type="password" placeholder="Current password"
            value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
          <input className="input" type="password" placeholder="New password (min. 6 chars)"
            value={newPw} onChange={e => setNewPw(e.target.value)} />
          <button className="btn-primary" onClick={() => save({ current_password: currentPw, new_password: newPw })}
            disabled={saving} style={{ alignSelf: "flex-start", padding: "9px 20px", fontSize: "0.82rem" }}>
            {saving ? "Saving..." : "Update Password"}
          </button>
        </div>
      </FieldRow>

      <FieldRow label="Member Since"
        value={new Date().getFullYear()}
        hint="Thank you for being part of BidVault." />
    </div>
  );
}

// ── Bids Tab ──────────────────────────────────────────────────
function BidsTab({ bids }) {
  if (!bids.length) return <EmptyState icon="🏷" message="No bids placed yet." link="/auctions" linkLabel="Browse auctions →" />;
  return (
    <div>
      <h2 style={{ fontSize: "1.6rem", fontWeight: 900, marginBottom: 28 }}>My Bids <span style={{ color: "var(--muted)", fontSize: "1rem", fontWeight: 400 }}>({bids.length})</span></h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {bids.map((b) => (
          <Link key={b.id} to={`/auctions/${b.auction_id}`} style={{ textDecoration: "none" }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "16px 0", borderBottom: "1px solid var(--border)",
              transition: "opacity 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              <div>
                <div style={{ fontWeight: 600, marginBottom: 3 }}>Auction #{b.auction_id}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{new Date(b.bid_date).toLocaleString()}</div>
              </div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.2rem", color: "var(--lime)" }}>
                ${b.amount?.toLocaleString()}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Listings Tab ──────────────────────────────────────────────
function ListingsTab({ products }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <h2 style={{ fontSize: "1.6rem", fontWeight: 900 }}>My Listings <span style={{ color: "var(--muted)", fontSize: "1rem", fontWeight: 400 }}>({products.length})</span></h2>
        <Link to="/products/create"><button className="btn-primary" style={{ fontSize: "0.82rem", padding: "8px 20px" }}>+ List New</button></Link>
      </div>
      {!products.length
        ? <EmptyState icon="📦" message="No listings yet." link="/products/create" linkLabel="List your first item →" />
        : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 1 }}>
            {products.map((p) => (
              <div key={p.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", overflow: "hidden" }}>
                <div style={{ height: 130, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {p.images?.[0]
                    ? <img src={`http://localhost:8000${p.images[0].url}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontSize: "2rem", opacity: 0.2 }}>🏷</span>}
                </div>
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: 6, lineHeight: 1.3 }}>{p.title}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>${p.starting_price?.toLocaleString()}</div>
                    <span className={`badge badge-${p.status}`}>{p.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

// ── Wins Tab ──────────────────────────────────────────────────
function WinsTab({ wins }) {
  if (!wins.length) return <EmptyState icon="🏆" message="No wins yet." link="/auctions" linkLabel="Browse live auctions →" />;
  return (
    <div>
      <h2 style={{ fontSize: "1.6rem", fontWeight: 900, marginBottom: 28 }}>Won Auctions <span style={{ color: "var(--muted)", fontSize: "1rem", fontWeight: 400 }}>({wins.length})</span></h2>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {wins.map((w) => (
          <Link key={w.id} to={`/auctions/${w.id}`} style={{ textDecoration: "none" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 16,
              padding: "16px 0", borderBottom: "1px solid var(--border)",
              transition: "opacity 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 2, flexShrink: 0,
                background: "var(--surface-2)", overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {w.product_image
                  ? <img src={`http://localhost:8000${w.product_image}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ opacity: 0.3 }}>🏷</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: 3 }}>🏆 {w.product_title}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>{new Date(w.end_date).toLocaleDateString()}</div>
              </div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.2rem", color: "var(--lime)" }}>
                ${w.final_price?.toLocaleString()}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────
function EmptyState({ icon, message, link, linkLabel }) {
  return (
    <div style={{ padding: "60px 0", textAlign: "center", borderTop: "1px solid var(--border)" }}>
      <div style={{ fontSize: "2.5rem", marginBottom: 12, opacity: 0.3 }}>{icon}</div>
      <p style={{ color: "var(--muted)", marginBottom: 16, fontSize: "0.9rem" }}>{message}</p>
      <Link to={link} style={{ textDecoration: "none" }}>
        <button className="btn-ghost" style={{ fontSize: "0.8rem", padding: "8px 20px" }}>{linkLabel}</button>
      </Link>
    </div>
  );
}