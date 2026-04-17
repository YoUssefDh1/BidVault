import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api";
import useAuthStore from "../store/authStore";
import BackToHome from "../components/BackToHome";
import ConfirmationDialog from "../components/ConfirmationDialog";

// Country list
const COUNTRIES = [
  "Algeria","Australia","Austria","Belgium","Brazil","Canada","China","Denmark",
  "Egypt","Finland","France","Germany","Greece","India","Indonesia","Ireland",
  "Italy","Japan","Jordan","Kuwait","Lebanon","Libya","Malaysia","Morocco",
  "Netherlands","New Zealand","Nigeria","Norway","Oman","Pakistan","Poland",
  "Portugal","Qatar","Romania","Russia","Saudi Arabia","South Africa","South Korea",
  "Spain","Sweden","Switzerland","Tunisia","Turkey","UAE","UK","USA","Ukraine",
];

const Label = ({ children }) => (
  <div style={{
    fontSize: "0.65rem", color: "var(--muted)",
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: "0.12em", textTransform: "uppercase",
    fontWeight: 700, marginBottom: 6,
  }}>{children}</div>
);

function AccountTab({ user, login }) {
  const [name, setName]             = useState(user?.name || "");
  const [city, setCity]             = useState("");
  const [country, setCountry]       = useState("");
  const [currentPw, setCurrentPw]   = useState("");
  const [newPw, setNewPw]           = useState("");
  const [fullUser, setFullUser]     = useState(null);
  const [saving, setSaving]         = useState(null); // which section is saving
  const [errors, setErrors]         = useState({});
  const [success, setSuccess]       = useState({});

  useEffect(() => {
    api.get("/users/me").then(({ data }) => {
      setFullUser(data);
      setName(data.name || "");
      setCity(data.city || "");
      setCountry(data.country || "");
    });
  }, []);

  const save = async (section, payload) => {
    setErrors({}); setSaving(section);
    try {
      const { data } = await api.put("/users/me", payload);
      login(data.access_token, data.role, {
        ...user,
        name: payload.name || user?.name,
      });
      const me = await api.get("/users/me");
      setFullUser(me.data);
      setSuccess({ [section]: "Saved successfully!" });
      setTimeout(() => setSuccess({}), 3000);
      setCurrentPw(""); setNewPw("");
    } catch (err) {
      setErrors({ [section]: err.response?.data?.detail || "Failed to save." });
    } finally { setSaving(null); }
  };

  const profileComplete = !!(fullUser?.city && fullUser?.country);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Completion banner */}
      {!profileComplete && (
        <div style={{
          display: "flex", alignItems: "center", gap: 16,
          padding: "16px 20px",
          background: "rgba(136,192,208,0.04)",
          border: "1px solid rgba(136,192,208,0.2)", borderRadius: 4,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
            background: "rgba(136,192,208,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.1rem",
          }}>📍</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: 2 }}>
              Complete your profile
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--muted)", lineHeight: 1.5 }}>
              Add your location so we can surface the best local auctions and sellers near you.
            </div>
          </div>
        </div>
      )}

      {/* ── Name card ── */}
      <SettingCard
        icon="👤"
        title="Display Name"
        description="This is how other buyers and sellers see you on BidVault."
        error={errors.name}
        success={success.name}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div style={{ flex: 1, maxWidth: 320 }}>
            <Label>Name</Label>
            <input className="input" value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your full name" />
          </div>
          <button className="btn-primary"
            onClick={() => save("name", { name })}
            disabled={saving === "name" || name === fullUser?.name}
            style={{ padding: "10px 22px", fontSize: "0.82rem", whiteSpace: "nowrap" }}>
            {saving === "name" ? "Saving..." : "Save"}
          </button>
        </div>
      </SettingCard>

      {/* ── Email card ── */}
      <SettingCard
        icon="✉️"
        title="Email Address"
        description="Your email is used to log in and receive notifications."
        locked="Contact support to change your email address."
      >
        <div style={{
          padding: "10px 14px", background: "var(--surface-3)",
          border: "1px solid var(--border)", borderRadius: 2,
          fontSize: "0.9rem", color: "var(--text-2)", maxWidth: 320,
        }}>
          {fullUser?.email}
        </div>
      </SettingCard>

      {/* ── Password card ── */}
      <SettingCard
        icon="🔒"
        title="Password"
        description="Use a strong password with at least 6 characters. We recommend a mix of letters, numbers and symbols."
        error={errors.password}
        success={success.password}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 320 }}>
          <div>
            <Label>Current Password</Label>
            <input className="input" type="password" placeholder="Enter current password"
              value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
          </div>
          <div>
            <Label>New Password</Label>
            <input className="input" type="password" placeholder="Min. 6 characters"
              value={newPw} onChange={e => setNewPw(e.target.value)} />
          </div>
          <button className="btn-primary"
            onClick={() => save("password", { current_password: currentPw, new_password: newPw })}
            disabled={saving === "password" || !currentPw || !newPw}
            style={{ alignSelf: "flex-start", padding: "10px 22px", fontSize: "0.82rem" }}>
            {saving === "password" ? "Updating..." : "Update Password"}
          </button>
        </div>
      </SettingCard>

      {/* ── Location card ── */}
      <SettingCard
        icon="🌍"
        title="Location"
        description="Helps us show you relevant auctions and sellers near you. Your location is never shared publicly."
        error={errors.location}
        success={success.location}
      >
        {fullUser?.city && fullUser?.country && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 12px",
            background: "rgba(136,192,208,0.07)",
            border: "1px solid rgba(136,192,208,0.2)",
            borderRadius: 2, marginBottom: 14, fontSize: "0.85rem",
          }}>
            <span className="live-dot" style={{ width: 6, height: 6, background: "var(--primary)" }} />
            {fullUser.city}, {fullUser.country}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 320 }}>
          <div>
            <Label>City</Label>
            <input className="input" placeholder="e.g. Tunis"
              value={city} onChange={e => setCity(e.target.value)} />
          </div>
          <div>
            <Label>Country</Label>
            <select className="input" value={country}
              onChange={e => setCountry(e.target.value)} style={{ cursor: "pointer" }}>
              <option value="">Select country...</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button className="btn-primary"
            onClick={() => save("location", { city, country })}
            disabled={saving === "location" || (!city && !country)}
            style={{ alignSelf: "flex-start", padding: "10px 22px", fontSize: "0.82rem" }}>
            {saving === "location" ? "Saving..." : "Save Location"}
          </button>
        </div>
      </SettingCard>

      {/* ── Member since ── */}
      <SettingCard icon="🗓️" title="Member Since" description="Thank you for being part of BidVault.">
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700, fontSize: "1.1rem", color: "var(--text-2)",
        }}>
          {fullUser?.created_at
            ? new Date(fullUser.created_at).toLocaleDateString("en-GB", { year: "numeric", month: "long" })
            : "—"}
        </div>
      </SettingCard>

    </div>
  );
}

// ── Setting card ──────────────────────────────────────────────
function SettingCard({ icon, title, description, locked, error, success, children }) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 4, overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 14,
        padding: "18px 20px", borderBottom: "1px solid var(--border)",
        background: "var(--surface-2)",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
          background: "var(--surface-3)", border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1rem",
        }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: "0.92rem", marginBottom: 2 }}>{title}</div>
          <div style={{ fontSize: "0.78rem", color: "var(--muted)", lineHeight: 1.5 }}>{description}</div>
        </div>
        {locked && (
          <div style={{
            fontSize: "0.72rem", color: "var(--muted)",
            background: "var(--surface-3)", border: "1px solid var(--border)",
            borderRadius: 2, padding: "4px 10px", flexShrink: 0, maxWidth: 180,
            textAlign: "center", lineHeight: 1.4,
          }}>{locked}</div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "20px" }}>
        {error   && <div className="msg-error"   style={{ marginBottom: 14 }}>{error}</div>}
        {success && <div className="msg-success" style={{ marginBottom: 14 }}>{success}</div>}
        {children}
      </div>
    </div>
  );
}

function BidsTab({ bids }) {
  if (!bids.length) return <EmptyState icon="🏷" message="No bids placed yet." link="/auctions" linkLabel="Browse auctions →" />;
  return (
    <div>
      <h2 style={{ fontSize: "1.6rem", fontWeight: 900, marginBottom: 28 }}>
        My Bids <span style={{ color: "var(--muted)", fontSize: "1rem", fontWeight: 400 }}>({bids.length})</span>
      </h2>
      <div style={{ display: "flex", flexDirection: "column" }}>
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
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.2rem", color: "var(--primary)" }}>
                ${b.amount?.toLocaleString()}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ListingsTab({ products }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <h2 style={{ fontSize: "1.6rem", fontWeight: 900 }}>
          My Listings <span style={{ color: "var(--muted)", fontSize: "1rem", fontWeight: 400 }}>({products.length})</span>
        </h2>
        <Link to="/products/create">
          <button className="btn-primary" style={{ fontSize: "0.82rem", padding: "8px 20px" }}>+ List New</button>
        </Link>
      </div>
      {!products.length ? (
        <EmptyState icon="📦" message="No listings yet." link="/products/create" linkLabel="List your first item →" />
      ) : (
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

function WinsTab({ wins }) {
  if (!wins.length) return <EmptyState icon="🏆" message="No wins yet." link="/auctions" linkLabel="Browse live auctions →" />;
  return (
    <div>
      <h2 style={{ fontSize: "1.6rem", fontWeight: 900, marginBottom: 28 }}>
        Won Auctions <span style={{ color: "var(--muted)", fontSize: "1rem", fontWeight: 400 }}>({wins.length})</span>
      </h2>
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
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.2rem", color: "var(--primary)" }}>
                ${w.final_price?.toLocaleString()}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function FavouritesTab({ favourites, onRemoveClick }) {
  if (!favourites.length) return (
    <EmptyState icon="🤍" message="No saved auctions yet." link="/auctions" linkLabel="Browse auctions →" />
  );

  return (
    <div>
      <h2 style={{ fontSize: "1.6rem", fontWeight: 900, marginBottom: 28 }}>
        Favourites <span style={{ color: "var(--muted)", fontSize: "1rem", fontWeight: 400 }}>({favourites.length})</span>
      </h2>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {favourites.map((f) => (
          <Link key={f.id} to={`/auctions/${f.id}`} style={{ textDecoration: "none" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 16,
              padding: "14px 0", borderBottom: "1px solid var(--border)",
              transition: "opacity 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              {/* Thumbnail */}
              <div style={{
                width: 56, height: 56, borderRadius: 2, flexShrink: 0,
                background: "var(--surface-2)", overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {f.product_image
                  ? <img src={`http://localhost:8000${f.product_image}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ opacity: 0.2 }}>🏷</span>}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: 4 }}>
                  {f.product_title}
                </div>
                <span className={`badge badge-${f.status}`}>{f.status}</span>
              </div>

              {/* Price + remove */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900, fontSize: "1.1rem", color: "var(--primary)", marginBottom: 4,
                }}>
                  ${f.current_price?.toLocaleString()}
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemoveClick(f.id); }}
                  style={{
                    background: "transparent", border: "none", cursor: "pointer",
                    fontSize: "0.72rem", color: "var(--muted)", padding: 0,
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--danger)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--muted)"}
                >Remove</button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

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

export default function Profile() {
  const { user, login } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "account";
  const setTab = (t) => setSearchParams({ tab: t });

  const [bids, setBids]         = useState([]);
  const [products, setProducts] = useState([]);
  const [wins, setWins]         = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [favToRemove, setFavToRemove] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get("/bids/mine").then(({ data }) => setBids(data)),
      api.get("/products/seller/mine").then(({ data }) => setProducts(data)),
      api.get("/users/me/wins").then(({ data }) => setWins(data)),
      api.get("/users/me/favourites").then(({ data }) => setFavourites(data)),
      api.get("/users/me/stats").then(({ data }) => setStats(data)),
    ]).finally(() => setLoading(false));
  }, []);

  // Refetch favourites when the tab changes to "favourites" to sync any changes from other pages
  useEffect(() => {
    if (tab === "favourites") {
      api.get("/users/me/favourites")
        .then(({ data }) => setFavourites(data))
        .catch(() => {});
    }
  }, [tab]);

  const handleRemoveFavClick = (auctionId) => {
    setFavToRemove(auctionId);
    setDialogOpen(true);
  };

  const removeFav = async () => {
    try {
      await api.delete(`/users/me/favourites/${favToRemove}`);
      setFavourites(prev => prev.filter(f => f.id !== favToRemove));
      setDialogOpen(false);
    } catch (err) {
      console.error("Failed to remove favourite", err);
    }
  };

  const navItems = [
    { key: "account",    label: "Account" },
    { key: "bids",       label: "My Bids",      count: bids.length },
    { key: "listings",   label: "My Listings",   count: products.length },
    { key: "wins",       label: "Won Auctions",  count: wins.length },
    { key: "favourites", label: "Favourites",    count: favourites.length },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "48px 32px" }}>
        <BackToHome />

      {/* Hello heading */}
      <h1 style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: "clamp(2.4rem, 5vw, 4rem)",
        fontWeight: 900, marginBottom: 8, lineHeight: 1,
      }}>
        Hello <span style={{ color: "var(--primary)" }}>{user?.name?.split(" ")[0]}</span>
      </h1>

      {/* Stats */}
      {stats && (
        <div style={{ display: "flex", gap: 32, marginBottom: 32, marginTop: 16 }}>
          {[
            { label: "Bids Placed",  value: stats.total_bids },
            { label: "Listings",     value: stats.total_listings },
            { label: "Auctions Won", value: stats.total_wins },
            { label: "Total Spent",  value: `$${stats.total_spent?.toLocaleString()}` },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.5rem", color: "var(--primary)" }}>
                {value}
              </span>
              <span style={{ fontSize: "0.78rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Barlow Condensed', sans-serif" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ height: 1, background: "var(--border)", marginBottom: 40 }} />

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 64 }}>

        {/* Sidebar */}
        <div>
          {navItems.map(({ key, label, count }) => {
            const active = tab === key;
            return (
              <div key={key} onClick={() => setTab(key)} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 0 10px 14px",
                borderLeft: active ? "2px solid var(--primary)" : "2px solid transparent",
                cursor: "pointer", transition: "all 0.15s", marginBottom: 4,
              }}>
                <span style={{
                  fontSize: "0.95rem", fontWeight: active ? 700 : 400,
                  color: active ? "var(--text)" : "var(--muted)", transition: "color 0.15s",
                }}>{label}</span>
                {count !== undefined && count > 0 && (
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)", flexShrink: 0 }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div>
          {loading ? (
            <div style={{ color: "var(--muted)", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Loading...
            </div>
          ) : (
            <>
              {tab === "account"    && <AccountTab user={user} login={login} />}
              {tab === "bids"       && <BidsTab bids={bids} />}
              {tab === "listings"   && <ListingsTab products={products} />}
              {tab === "wins"       && <WinsTab wins={wins} />}
              {tab === "favourites" && <FavouritesTab favourites={favourites} setFavourites={setFavourites} onRemoveClick={handleRemoveFavClick} />}
            </>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={dialogOpen}
        title="Remove Favorite"
        message="Are you sure you want to remove this auction from your favorites?"
        onConfirm={removeFav}
        onCancel={() => setDialogOpen(false)}
        confirmText="Remove"
        isDangerous={true}
      />
    </div>
  );
}