import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api";
import useAuthStore from "../store/authStore";

export default function Navbar() {
  const { token, role, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const [search, setSearch]           = useState("");
  const [focused, setFocused]         = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showDrop, setShowDrop]       = useState(false);
  const [activeIdx, setActiveIdx]     = useState(-1);
  const debounceRef = useRef(null);
  const wrapperRef  = useRef(null);

  // ── Fetch suggestions with debounce ──────────────────────────
  useEffect(() => {
    if (search.trim().length < 2) { setSuggestions([]); setShowDrop(false); return; }
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
            BID<span style={{ color: "var(--lime)" }}>VAULT</span>
            <span style={{ color: "var(--lime)", fontSize: "1.1rem" }}>.</span>
          </span>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSubmit}
          ref={wrapperRef}
          style={{ flex: 1, maxWidth: 420, margin: "0 32px", position: "relative" }}>

          <div style={{
            display: "flex", alignItems: "center",
            background: "var(--surface-2)",
            border: `1px solid ${focused ? "var(--lime)" : "var(--border)"}`,
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
                background: "var(--lime)", border: "none", cursor: "pointer",
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
              background: "var(--surface)", border: "1px solid var(--lime)",
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
                    background: i === activeIdx ? "rgba(200,255,0,0.07)" : "transparent",
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
                      fontSize: "0.62rem", color: a.status === "active" ? "var(--lime)" : "var(--muted)",
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
                  color: "var(--lime)",
                  borderTop: "1px solid var(--border)",
                }}>
                View all results for "{search}" →
              </div>
            </div>
          )}
        </form>

        {/* Right Auth */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {token ? (
            <>
              <Link to="/profile" style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "5px 12px", border: "1px solid var(--border-2)",
                  borderRadius: 2, cursor: "pointer", transition: "border-color 0.15s",
                }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: "50%",
                    background: "var(--lime)", display: "flex", alignItems: "center",
                    justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 900, fontSize: "0.8rem", color: "#000",
                  }}>
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)", lineHeight: 1.2 }}>
                      {user?.name || user?.email}
                    </div>
                    <div style={{
                      fontSize: "0.65rem", color: "var(--lime)",
                      fontFamily: "'Barlow Condensed', sans-serif",
                      textTransform: "uppercase", letterSpacing: "0.1em",
                    }}>{role}</div>
                  </div>
                </div>
              </Link>
              <button className="btn-ghost" onClick={() => { logout(); navigate("/"); }}
                style={{ padding: "6px 14px", fontSize: "0.78rem" }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="btn-ghost" style={{ padding: "7px 18px" }}>Login</button>
              </Link>
              <Link to="/register">
                <button className="btn-primary" style={{ padding: "7px 20px" }}>Register</button>
              </Link>
            </>
          )}
        </div>

      </div>
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
      <span style={{ color: "var(--lime)", fontWeight: 700 }}>
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}