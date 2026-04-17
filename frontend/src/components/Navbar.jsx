import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api";
import useAuthStore from "../store/authStore";
import AuthModal from "./AuthModal";
import AuthNudge from "./AuthNudge";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { token, role, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [authModal, setAuthModal]      = useState(null); // "login" | "register" | null
  const [search, setSearch]           = useState("");
  const [focused, setFocused]         = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showDrop, setShowDrop]       = useState(false);
  const [activeIdx, setActiveIdx]     = useState(-1);
  const debounceRef = useRef(null);
  const wrapperRef  = useRef(null);

  // ── Fetch suggestions with debounce ──────────────────────────
  useEffect(() => {
    if (search.trim().length < 2) return;
    setSuggestions([]);
    setShowDrop(false);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get(`/auctions?search=${encodeURIComponent(search.trim())}`);
        setSuggestions(data.slice(0, 6));
        setShowDrop(true);
        setActiveIdx(-1);
      } catch { setSuggestions([]); }
    }, 280);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // ── Close dropdown on outside click ──────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDrop(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Clear dropdown on route change ───────────────────────────
  useEffect(() => {
    setShowDrop(false);
    setSearch("");
  }, [location.pathname]);

  const doSearch = (term) => {
    if (!term.trim()) return;
    setShowDrop(false);
    setSuggestions([]);
    setSearch("");
    navigate(`/auctions?search=${encodeURIComponent(term.trim())}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const term = activeIdx >= 0 ? suggestions[activeIdx]?.product?.title : search;
    doSearch(term || search);
  };

  const handleKeyDown = (e) => {
    if (!showDrop || suggestions.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, suggestions.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
    if (e.key === "Escape")    { setShowDrop(false); setActiveIdx(-1); }
  };

  return (
    <nav style={{
      background: "rgba(0,0,0,0.95)", backdropFilter: "blur(10px)",
      borderBottom: "1px solid var(--border)",
      position: "sticky", top: 0, zIndex: 100, width: "100%",
    }}>
      <div style={{
        maxWidth: 1400, margin: "0 auto", padding: "0 32px",
        height: 60, display: "flex", alignItems: "center",
        justifyContent: "space-between", width: "100%",
      }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none", flexShrink: 0 }}>
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900, fontSize: "1.5rem",
            color: "var(--text)", letterSpacing: "0.02em", textTransform: "uppercase",
          }}>
            BID<span style={{ color: "var(--primary)" }}>VAULT</span>
            <span style={{ color: "var(--primary)", fontSize: "1.1rem" }}>.</span>
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
          {[
            { to: "/auctions", label: "Live Auctions", show: true },
            { to: "/products/create", label: "Sell", show: token && role === "user" },
            { to: "/admin", label: "Dashboard", show: role === "admin" },
          ].filter(l => l.show).map(({ to, label }) => (
            <Link key={to} to={to} style={{ textDecoration: "none" }}>
              <span style={{
                padding: "6px 14px",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700, fontSize: "0.85rem",
                letterSpacing: "0.08em", textTransform: "uppercase",
                color: location.pathname === to ? "var(--primary)" : "var(--text-2)",
                borderBottom: location.pathname === to ? "2px solid var(--primary)" : "2px solid transparent",
                transition: "all 0.15s ease", display: "block", paddingBottom: 4,
              }}>{label}</span>
            </Link>
          ))}
        </div>

        {/* Search bar */}
        <form onSubmit={handleSubmit}
          ref={wrapperRef}
          style={{ flex: 1, maxWidth: 420, margin: "0 32px", position: "relative" }}>

          <div style={{
            display: "flex", alignItems: "center",
            background: "var(--surface-2)",
            border: `1px solid ${focused ? "var(--primary)" : "var(--border)"}`,
            borderRadius: showDrop && suggestions.length > 0 ? "2px 2px 0 0" : 2,
            overflow: "hidden", transition: "border-color 0.15s ease",
          }}>
            <span style={{ padding: "0 12px", color: "var(--muted)", fontSize: "0.85rem", flexShrink: 0 }}>
              🔍
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="Search lots, artists, models..."
              autoComplete="off"
              style={{
                flex: 1, background: "transparent", border: "none",
                outline: "none", color: "var(--text)",
                fontFamily: "'Barlow', sans-serif", fontSize: "0.85rem",
                padding: "9px 0",
              }}
            />
            {search && (
              <button type="submit" style={{
                background: "var(--primary)", border: "none", cursor: "pointer",
                padding: "0 14px", alignSelf: "stretch",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800, fontSize: "0.72rem",
                letterSpacing: "0.08em", color: "#000",
              }}>GO</button>
            )}
          </div>

          {/* Suggestions dropdown */}
          {showDrop && suggestions.length > 0 && (
            <div style={{
              position: "absolute", top: "100%", left: 0, right: 0, zIndex: 200,
              background: "var(--surface)", border: "1px solid var(--primary)",
              borderTop: "none", borderRadius: "0 0 2px 2px",
              overflow: "hidden",
              boxShadow: "0 12px 32px rgba(0,0,0,0.6)",
            }}>
              {suggestions.map((a, i) => (
                <div key={a.id}
                  onMouseDown={() => { doSearch(a.product.title); }}
                  onMouseEnter={() => setActiveIdx(i)}
                  style={{
                    padding: "10px 14px",
                    display: "flex", alignItems: "center", gap: 12,
                      background: i === activeIdx ? "rgba(136,192,208,0.07)" : "transparent",
                    borderBottom: i < suggestions.length - 1 ? "1px solid var(--border)" : "none",
                    cursor: "pointer", transition: "background 0.1s",
                  }}>

                  {/* Thumbnail */}
                  <div style={{
                    width: 36, height: 36, flexShrink: 0, borderRadius: 2,
                    overflow: "hidden", background: "var(--surface-3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {a.product?.images?.[0] ? (
                      <img src={`http://localhost:8000${a.product.images[0].url}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: "0.9rem", opacity: 0.4 }}>🏷</span>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: "0.82rem", fontWeight: 600, color: "var(--text)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {/* Highlight matching part */}
                      {highlightMatch(a.product.title, search)}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "var(--muted)", marginTop: 1 }}>
                      {a.product?.category?.name || "Uncategorized"}
                    </div>
                  </div>

                  {/* Price + status */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 800, fontSize: "0.88rem", color: "var(--text)",
                    }}>
                      ${a.product?.current_price?.toLocaleString()}
                    </div>
                    <div style={{
                      fontSize: "0.62rem", color: a.status === "active" ? "var(--primary)" : "var(--muted)",
                      fontFamily: "'Barlow Condensed', sans-serif",
                      textTransform: "uppercase", letterSpacing: "0.08em",
                      display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end",
                    }}>
                      {a.status === "active" && <span className="live-dot" style={{ width: 4, height: 4 }} />}
                      {a.status}
                    </div>
                  </div>
                </div>
              ))}

              {/* View all results footer */}
              <div
                onMouseDown={() => doSearch(search)}
                style={{
                  padding: "8px 14px", textAlign: "center",
                  background: "var(--surface-2)", cursor: "pointer",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700, fontSize: "0.72rem",
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "var(--primary)",
                  borderTop: "1px solid var(--border)",
                }}>
                View all results for "{search}" →
              </div>
            </div>
          )}
        </form>

        {/* Right Auth */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <NotificationBell />
          {token ? (
            <ProfileDropdown user={user} role={role} onLogout={() => { logout(); navigate("/"); }} navigate={navigate} />
          ) : (
            <>
              <button className="btn-ghost"
                onClick={() => setAuthModal("login")}
                style={{ padding: "7px 18px" }}>Login</button>
              <button className="btn-primary"
                onClick={() => setAuthModal("register")}
                style={{ padding: "7px 20px" }}>Register</button>
            </>
          )}
        </div>

      </div>

      {/* Auth Modal */}
      {authModal && (
        <AuthModal mode={authModal} onClose={() => setAuthModal(null)} />
      )}

      {/* Auth Nudge — bottom left for guests */}
      <AuthNudge
        onLogin={() => setAuthModal("login")}
        onRegister={() => setAuthModal("register")}
      />

    </nav>
  );
}

// Highlight the matching substring in lime
function highlightMatch(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span style={{ color: "var(--primary)", fontWeight: 700 }}>
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}

// ── Profile Dropdown ──────────────────────────────────────────
function ProfileDropdown({ user, onLogout, navigate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const go = (path, tab) => {
    setOpen(false);
    navigate(tab ? `${path}?tab=${tab}` : path);
  };

  const menuItems = [
    { label: "My Bids",        icon: "🏷", tab: "bids" },
    { label: "My Listings",    icon: "📦", tab: "listings" },
    { label: "Won Auctions",   icon: "🏆", tab: "wins" },
    { label: "Favourites",     icon: "🤍", tab: "favourites" },
    { label: "Edit Profile",   icon: "⚙️", tab: "account" },
  ];

  return (
    <div ref={ref} style={{ position: "relative" }}>

      {/* Trigger */}
      <div onClick={() => setOpen(o => !o)} style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "5px 12px", border: `1px solid ${open ? "var(--primary)" : "var(--border-2)"}`,
        borderRadius: 2, cursor: "pointer", transition: "border-color 0.15s",
        userSelect: "none",
      }}>
        {/* Person icon */}
        <div style={{
          width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
          background: "var(--surface-3)",
          border: `1px solid ${open ? "var(--primary)" : "var(--border-2)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "border-color 0.15s",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke={open ? "var(--primary)" : "var(--text-2)"}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transition: "stroke 0.15s" }}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <span style={{
          fontSize: "0.82rem", fontWeight: 600,
          color: open ? "var(--primary)" : "var(--text)",
          transition: "color 0.15s",
        }}>
          {user?.name?.split(" ")[0] || user?.email?.split("@")[0]}
        </span>
        <span style={{
          fontSize: "1.4rem", color: "var(--primary)",
          marginLeft: 2,
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
          transform: open ? "rotate(270deg)" : "rotate(90deg)",
          transition: "transform 0.2s",
          display: "inline-block", lineHeight: 1,
        }}>›</span>
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          width: 220, zIndex: 200,
          background: "var(--surface)",
          border: "1px solid var(--border-2)",
          borderRadius: 4,
          boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
          overflow: "hidden",
          animation: "fadeUp 0.15s ease forwards",
        }}>

          {/* User header */}
          <div style={{
            padding: "14px 16px",
            borderBottom: "1px solid var(--border)",
            background: "var(--surface-2)",
          }}>
            <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 2 }}>
              {user?.name}
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
              {user?.email}
            </div>
          </div>

          {/* Menu items */}
          <div style={{ padding: "6px 0" }}>
            {menuItems.map(({ label, icon, tab }) => (
              <div key={tab} onClick={() => go("/profile", tab)} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 16px", cursor: "pointer",
                transition: "background 0.1s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ fontSize: "0.9rem", width: 18, textAlign: "center" }}>{icon}</span>
                <span style={{ fontSize: "0.85rem", color: "var(--text-2)" }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Sign out */}
          <div style={{ borderTop: "1px solid var(--border)", padding: "6px 0" }}>
            <div onClick={() => { setOpen(false); onLogout(); }} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 16px", cursor: "pointer",
              transition: "background 0.1s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,68,68,0.06)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize: "0.9rem", width: 18, textAlign: "center" }}>↩</span>
              <span style={{ fontSize: "0.85rem", color: "var(--danger)" }}>Sign out</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}