import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import useAuthStore from "../store/authStore";

// ── Category icon map ─────────────────────────────────────────
const CAT_ICONS = {
  "Modern Art":             "🎨",
  "Automotive":             "🚗",
  "Horology":               "⌚",
  "Jewelry & Gems":         "💎",
  "Electronics":            "📱",
  "Fashion":                "👜",
  "Collectibles":           "🏆",
  "Real Estate":            "🏠",
  "Books & Manuscripts":    "📚",
  "Wine & Spirits":         "🍷",
  "Musical Instruments":    "🎸",
  "Gaming & Consoles":      "🎮",
  "Photography Equipment":  "📷",
};

// ── Category Bar ──────────────────────────────────────────────
function CategoryBar() {
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat]   = useState(null);
  const [canLeft,  setCanLeft]      = useState(false);
  const [canRight, setCanRight]     = useState(true);
  const navigate  = useNavigate();
  const scrollRef = useRef(null);

  useEffect(() => {
    api.get("/categories").then(({ data }) => setCategories(data));
  }, []);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows);
    window.addEventListener("resize", updateArrows);
    return () => { el.removeEventListener("scroll", updateArrows); window.removeEventListener("resize", updateArrows); };
  }, [categories]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth / 2), behavior: "smooth" });
  };

  const handleCat = (cat) => {
    if (activeCat?.id === cat?.id) { setActiveCat(null); navigate("/auctions"); }
    else { setActiveCat(cat || null); if (cat) navigate(`/auctions?category_id=${cat.id}`); else navigate("/auctions"); }
  };

  const handleSub = (sub) => {
    navigate(`/auctions?category_id=${activeCat.id}&subcategory_id=${sub.id}`);
  };

  if (!categories.length) return null;

  const ArrowBtn = ({ dir, visible, onClick }) => (
    <div onClick={onClick} style={{
      position: "absolute",
      [dir === -1 ? "left" : "right"]: 0,
      top: 0, bottom: 0, zIndex: 3,
      width: 64,
      display: "flex", alignItems: "center",
      justifyContent: dir === -1 ? "flex-start" : "flex-end",
      padding: "0 10px",
      background: dir === -1
        ? "linear-gradient(to right, rgba(0,0,0,1) 40%, transparent)"
        : "linear-gradient(to left,  rgba(0,0,0,1) 40%, transparent)",
      cursor: visible ? "pointer" : "default",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.2s",
      pointerEvents: visible ? "auto" : "none",
    }}>
      <span style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 900, fontSize: "1.4rem",
        color: "var(--lime)", lineHeight: 1,
        userSelect: "none",
      }}>
        {dir === -1 ? "‹" : "›"}
      </span>
    </div>
  );

  return (
    <div style={{
      borderBottom: "1px solid var(--border)",
      background: "rgba(0,0,0,0.97)",
      position: "sticky", top: 60, zIndex: 90,
    }}>
      {/* ── Main category row ── */}
      <div style={{ position: "relative" }}>
        <div ref={scrollRef} style={{
          maxWidth: 1400, margin: "0 auto", padding: "0 32px",
          display: "flex", alignItems: "center",
          overflowX: "auto", scrollbarWidth: "none",
          msOverflowStyle: "none",
          scrollBehavior: "smooth",
        }}>

          {/* Left arrow — sticky inside scroll */}
          {canLeft && (
            <div onClick={() => scroll(-1)} style={{
              position: "sticky", left: 0, flexShrink: 0,
              zIndex: 3, height: "100%",
              display: "flex", alignItems: "center",
              paddingRight: 8,
              background: "linear-gradient(to right, rgba(0,0,0,1) 60%, transparent)",
              cursor: "pointer",
            }}>
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900, fontSize: "1.6rem",
                color: "var(--lime)", lineHeight: 1, userSelect: "none",
              }}>‹</span>
            </div>
          )}

          {/* All */}
          <div onClick={() => handleCat(null)} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 6, padding: "14px 20px", cursor: "pointer", flexShrink: 0,
            borderBottom: !activeCat ? "2px solid var(--lime)" : "2px solid transparent",
            transition: "all 0.15s",
          }}>
            <span style={{ fontSize: "1.3rem" }}>✦</span>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase",
              color: !activeCat ? "var(--lime)" : "var(--muted)", transition: "color 0.15s",
            }}>All</span>
          </div>

          {categories.map((cat) => {
            const isActive = activeCat?.id === cat.id;
            return (
              <div key={cat.id} onClick={() => handleCat(cat)} style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: 6, padding: "14px 20px", cursor: "pointer", flexShrink: 0,
                borderBottom: isActive ? "2px solid var(--lime)" : "2px solid transparent",
                transition: "all 0.15s",
              }}>
                <span style={{ fontSize: "1.3rem" }}>{CAT_ICONS[cat.name] || "🏷"}</span>
                <span style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                  fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase",
                  color: isActive ? "var(--lime)" : "var(--muted)",
                  whiteSpace: "nowrap", transition: "color 0.15s",
                }}>{cat.name}</span>
              </div>
            );
          })}

          {/* Right arrow — sticky inside scroll */}
          {canRight && (
            <div onClick={() => scroll(1)} style={{
              position: "sticky", right: 0, flexShrink: 0,
              zIndex: 3, height: "100%",
              display: "flex", alignItems: "center",
              paddingLeft: 8,
              background: "linear-gradient(to left, rgba(0,0,0,1) 60%, transparent)",
              cursor: "pointer",
            }}>
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900, fontSize: "1.6rem",
                color: "var(--lime)", lineHeight: 1, userSelect: "none",
              }}>›</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Subcategory row ── */}
      {activeCat?.subcategories?.length > 0 && (
        <div style={{
          borderTop: "1px solid var(--border)", background: "var(--surface)",
          overflowX: "auto", scrollbarWidth: "none",
        }}>
          <div style={{
            maxWidth: 1400, margin: "0 auto", padding: "0 32px",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <span style={{
              fontSize: "0.65rem", color: "var(--muted)",
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: "0.1em", textTransform: "uppercase",
              paddingRight: 12, flexShrink: 0,
              borderRight: "1px solid var(--border)", marginRight: 8,
            }}>{activeCat.name}</span>
            {activeCat.subcategories.map((sub) => (
              <div key={sub.id} onClick={() => handleSub(sub)} style={{
                padding: "8px 14px", cursor: "pointer", flexShrink: 0,
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 600, fontSize: "0.78rem",
                letterSpacing: "0.06em", textTransform: "uppercase",
                color: "var(--text-2)", whiteSpace: "nowrap",
                borderRadius: 2, transition: "all 0.15s",
                border: "1px solid transparent",
              }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--lime)"; e.currentTarget.style.borderColor = "rgba(200,255,0,0.2)"; e.currentTarget.style.background = "rgba(200,255,0,0.04)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = "transparent"; }}
              >{sub.name}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Countdown ─────────────────────────────────────────────────
function Countdown({ endDate, style = {} }) {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => {
      const diff = new Date(endDate) - new Date();
      if (diff <= 0) { setTime("ENDED"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTime(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);
  return <span style={style}>{time}</span>;
}

// ── Small Card ────────────────────────────────────────────────
function SmallCard({ auction }) {
  const product = auction.product;
  return (
    <Link to={`/auctions/${auction.id}`} style={{ textDecoration: "none", height: "100%", display: "block" }}>
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        overflow: "hidden", height: "100%", display: "flex", flexDirection: "column",
        cursor: "pointer", transition: "border-color 0.2s",
      }}>
        {/* Image */}
        <div style={{
          width: "100%", height: 200, background: "var(--surface-2)",
          overflow: "hidden", position: "relative", flexShrink: 0,
        }}>
          {product.images?.[0] ? (
            <img src={`http://localhost:8000${product.images[0].url}`}
              alt={product.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", opacity: 0.2 }}>🏷</div>
          )}
          {auction.status === "active" && (
            <div style={{
              position: "absolute", top: 8, left: 8,
              display: "flex", alignItems: "center", gap: 4,
              background: "rgba(0,0,0,0.85)", border: "1px solid var(--lime)",
              padding: "2px 7px", borderRadius: 1,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", color: "var(--lime)",
            }}>
              <span className="live-dot" style={{ width: 5, height: 5 }} /> LIVE
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 4, lineHeight: 1.2 }}>{product.title}</h3>
          <p style={{
            fontSize: "0.76rem", color: "var(--muted)", marginBottom: 12, lineHeight: 1.5, flex: 1,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>{product.description}</p>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: "0.6rem", color: "var(--muted)", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>Current Bid</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.2rem" }}>
                ${product.current_price?.toLocaleString()}
              </div>
            </div>
            {auction.status === "active" && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.6rem", color: "var(--muted)", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>Ends In</div>
                <Countdown endDate={auction.end_date} style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
                  fontSize: "0.95rem", color: "var(--lime)",
                }} />
              </div>
            )}
          </div>

          <div style={{
            width: "100%", padding: "9px", textAlign: "center",
            background: "transparent", border: "1px solid var(--border-2)",
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
            fontSize: "0.76rem", letterSpacing: "0.1em", color: "var(--text)",
            cursor: "pointer",
          }}>PLACE BID</div>
        </div>
      </div>
    </Link>
  );
}

// ── Featured Card ─────────────────────────────────────────────
function FeaturedCard({ auction }) {
  const product = auction.product;
  return (
    <Link to={`/auctions/${auction.id}`} style={{ textDecoration: "none", height: "100%", display: "block" }}>
      <div style={{
        position: "relative", height: "100%", minHeight: 320,
        overflow: "hidden", cursor: "pointer",
        background: "var(--surface-3)", border: "1px solid var(--border)",
      }}>
        {/* Background image with overlay */}
        {product.images?.[0] && (
          <img src={`http://localhost:8000${product.images[0].url}`}
            alt={product.title}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%", objectFit: "cover",
              filter: "brightness(0.35)",
            }} />
        )}

        {/* Viewers badge top right */}
        <div style={{
          position: "absolute", top: 16, right: 16,
          background: "rgba(0,0,0,0.7)", border: "1px solid var(--border-2)",
          padding: "4px 10px", borderRadius: 2,
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em",
          color: "var(--text-2)",
        }}>
          👁 {auction.bid_count || 0} Bids
        </div>

        {/* Content overlay */}
        <div style={{
          position: "relative", zIndex: 1,
          height: "100%", padding: "28px 32px",
          display: "flex", flexDirection: "column", justifyContent: "flex-end",
        }}>
          {/* Premium lot label */}
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700, fontSize: "0.68rem",
            letterSpacing: "0.15em", textTransform: "uppercase",
            color: "var(--lime)", marginBottom: 8,
          }}>
            ◆ PREMIUM LOT
          </div>

          <h2 style={{
            fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
            fontWeight: 900, lineHeight: 1,
            marginBottom: 10, color: "var(--text)",
          }}>{product.title}</h2>

          <p style={{
            color: "var(--text-2)", fontSize: "0.85rem",
            lineHeight: 1.6, marginBottom: 24, maxWidth: 400,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>{product.description}</p>

          {/* Bid row */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div>
              <div style={{
                fontSize: "0.6rem", color: "var(--muted)",
                fontFamily: "'Barlow Condensed', sans-serif",
                textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 2,
              }}>Current Bid</div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900, fontSize: "2.2rem",
                color: "var(--text)", letterSpacing: "-0.01em", lineHeight: 1,
              }}>
                ${product.current_price?.toLocaleString()}
              </div>
            </div>
            <div style={{
              background: "var(--lime)", color: "#000",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900, fontSize: "0.9rem",
              letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "12px 28px", borderRadius: 2,
              whiteSpace: "nowrap",
            }}>
              BID NOW →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Ticker ────────────────────────────────────────────────────
function Ticker({ auctions }) {
  const items = auctions.slice(0, 8);
  if (!items.length) return null;
  const content = items.map((a, i) => (
    `BID PLACED: ${a.product?.title?.toUpperCase()} — $${a.product?.current_price?.toLocaleString()}`
  )).join("   ·   ");
  const doubled = content + "   ·   " + content;

  return (
    <div style={{
      background: "var(--lime)", color: "#000", overflow: "hidden",
      padding: "8px 0", borderTop: "1px solid #000", borderBottom: "1px solid #000",
    }}>
      <div className="ticker-track">
        <span style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 800, fontSize: "0.78rem",
          letterSpacing: "0.08em", whiteSpace: "nowrap",
          paddingRight: 40,
        }}>
          {doubled}
        </span>
        <span style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 800, fontSize: "0.78rem",
          letterSpacing: "0.08em", whiteSpace: "nowrap",
          paddingRight: 40,
        }}>
          {doubled}
        </span>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function Home() {
  const [auctions, setAuctions] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const { role, token } = useAuthStore();

  useEffect(() => {
    api.get("/auctions?status=active").then(({ data }) => {
      setAuctions(data);
      const hottest = [...data].sort((a, b) => (b.bid_count || 0) - (a.bid_count || 0))[0] || null;
      setFeatured(hottest);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* ── CATEGORY BAR ─────────────────────────────────────── */}
      <CategoryBar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <div style={{
        position: "relative", minHeight: "88vh",
        display: "flex", alignItems: "center",
        borderBottom: "1px solid var(--border)",
        overflow: "hidden",
      }}>
        {/* Subtle background grain */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 60% 50%, rgba(200,255,0,0.03) 0%, transparent 60%)",
          pointerEvents: "none",
        }} />

        {/* Hero text — full width, left aligned */}
        <div style={{ padding: "80px 64px", maxWidth: 1400, width: "100%", margin: "0 auto" }}>
          <div className="animate-fade-up" style={{ maxWidth: 680 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              border: "1px solid var(--border-2)", borderRadius: 2,
              padding: "4px 12px", marginBottom: 32,
            }}>
              <span className="live-dot" />
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700, fontSize: "0.72rem",
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: "var(--lime)",
              }}>Live Market Open</span>
            </div>

            <h1 style={{
              fontSize: "clamp(5rem, 9vw, 10rem)",
              fontWeight: 900, lineHeight: 0.92,
              marginBottom: 32, color: "var(--text)",
            }}>
              ACQUIRE<br />
              THE{" "}
              <span style={{ color: "transparent", WebkitTextStroke: "2px var(--text)" }}>
                RARE.
              </span>
            </h1>

            <p style={{
              color: "var(--muted)", fontSize: "1rem",
              maxWidth: 420, lineHeight: 1.7, marginBottom: 40,
            }}>
              The premier auction platform for exclusive items.
              Real-time bidding, verified listings, and instant results.
            </p>

            <div style={{ display: "flex", gap: 12 }}>
              <Link to="/auctions">
                <button className="btn-primary" style={{ fontSize: "0.9rem", padding: "12px 32px" }}>
                  View Catalog →
                </button>
              </Link>
              {token && role === "user" && (
                <Link to="/products/create">
                  <button className="btn-ghost" style={{ fontSize: "0.9rem", padding: "12px 28px" }}>
                    List Item
                  </button>
                </Link>
              )}
              {!token && (
                <Link to="/register">
                  <button className="btn-ghost" style={{ fontSize: "0.9rem", padding: "12px 28px" }}>
                    Create Account
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Floating featured card — center vertically, left of center horizontally */}
        {featured && (
          <Link to={`/auctions/${featured.id}`} style={{ textDecoration: "none" }}>
            <div style={{
              position: "absolute", top: "50%", left: "52%",
              transform: "translateY(-50%)",
              width: 380,
              background: "rgba(13,13,13,0.94)",
              backdropFilter: "blur(16px)",
              border: "1px solid var(--border-2)",
              borderRadius: 4,
              overflow: "hidden",
              boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
              cursor: "pointer",
              transition: "transform 0.25s ease, border-color 0.2s ease",
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(calc(-50% - 5px))"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(-50%)"}
            >
              {/* Lot tag */}
              <div style={{
                position: "absolute", top: 12, left: 12, zIndex: 2,
                background: "rgba(0,0,0,0.85)", border: "1px solid var(--border)",
                padding: "3px 10px", borderRadius: 2,
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "0.65rem", letterSpacing: "0.1em",
                color: "var(--muted)", textTransform: "uppercase",
              }}>
                LOT #{String(featured.id).padStart(4, "0")}
              </div>

              {/* Live badge */}
              {featured.status === "active" && (
                <div style={{
                  position: "absolute", top: 12, right: 12, zIndex: 2,
                  display: "flex", alignItems: "center", gap: 5,
                  background: "rgba(0,0,0,0.85)", border: "1px solid var(--lime)",
                  padding: "3px 10px", borderRadius: 2,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: "var(--lime)",
                }}>
                  <span className="live-dot" style={{ width: 5, height: 5 }} /> LIVE
                </div>
              )}

              {/* Image */}
              <div style={{ width: "100%", height: 240, background: "var(--surface-2)", overflow: "hidden" }}>
                {featured.product?.images?.[0] ? (
                  <img src={`http://localhost:8000${featured.product.images[0].url}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem", opacity: 0.15 }}>🏷</div>
                )}
              </div>

              {/* Card body */}
              <div style={{ padding: "18px 20px" }}>
                <div style={{ fontSize: "0.7rem", color: "var(--muted)", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                  {featured.product?.category?.name || "Featured Lot"}
                </div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: 14, lineHeight: 1.3 }}>
                  {featured.product?.title}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontSize: "0.6rem", color: "var(--muted)", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      Current High Bid
                    </div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.7rem", color: "var(--text)", lineHeight: 1 }}>
                      ${featured.product?.current_price?.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.6rem", color: "var(--muted)", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      Ends In
                    </div>
                    <Countdown endDate={featured.end_date} style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 900, fontSize: "1.1rem", color: "var(--lime)",
                    }} />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* ── TICKER ───────────────────────────────────────────── */}
      <Ticker auctions={auctions} />

      {/* ── TRENDING LOTS ────────────────────────────────────── */}
      <div className="page">
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 20,
          paddingBottom: 16, borderBottom: "1px solid var(--border)",
        }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 900 }}>Trending Lots</h2>
          <Link to="/auctions">
            <button className="btn-ghost" style={{ fontSize: "0.78rem", padding: "7px 18px" }}>
              View All →
            </button>
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "var(--muted)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Loading lots...
          </div>
        ) : auctions.length === 0 ? (
          <div className="card" style={{ padding: 60, textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16, opacity: 0.3 }}>🏷</div>
            <h3 style={{ marginBottom: 8, fontSize: "1.4rem" }}>No Active Auctions</h3>
            <p style={{ color: "var(--muted)" }}>Check back soon or be the first to list.</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateRows: "auto auto",
            gap: 1,
          }}>

            {/* Cell 1 — small card, row 1 col 1 */}
            {auctions[0] && (
              <div style={{ gridColumn: "1", gridRow: "1" }}>
                <SmallCard auction={auctions[0]} />
              </div>
            )}

            {/* Cell 2 — FEATURED card, row 1 col 2-3 */}
            {auctions[1] && (
              <div style={{ gridColumn: "2 / 4", gridRow: "1" }}>
                <FeaturedCard auction={auctions[1]} />
              </div>
            )}

            {/* Cell 3 — small card, row 2 col 1 */}
            {auctions[2] && (
              <div style={{ gridColumn: "1", gridRow: "2" }}>
                <SmallCard auction={auctions[2]} />
              </div>
            )}

            {/* Cell 4 — small card, row 2 col 2 */}
            {auctions[3] && (
              <div style={{ gridColumn: "2", gridRow: "2" }}>
                <SmallCard auction={auctions[3]} />
              </div>
            )}

            {/* Cell 5 — CTA card, row 2 col 3 */}
            <div style={{ gridColumn: "3", gridRow: "2" }}>
              <div style={{
                height: "100%", minHeight: 260,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                textAlign: "center", padding: 32,
                background: "var(--text)", color: "#000",
                border: "1px solid var(--border)",
              }}>
                <h3 style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "2rem", fontWeight: 900,
                  marginBottom: 12, lineHeight: 1,
                  color: "#000",
                }}>
                  LIST YOUR<br />COLLECTION
                </h3>
                <p style={{ fontSize: "0.82rem", marginBottom: 24, lineHeight: 1.6, color: "#444", maxWidth: 200 }}>
                  Access a global network of qualified buyers with zero friction.
                </p>
                <Link to={token ? "/products/create" : "/register"}>
                  <button style={{
                    background: "#000", color: "#fff",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 800, fontSize: "0.82rem",
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    padding: "10px 24px", borderRadius: 2, border: "none",
                    cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
                  }}>
                    Start Consignment →
                  </button>
                </Link>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ── WHY BIDVAULT ─────────────────────────────────────── */}
      <div style={{ borderTop: "1px solid var(--border)", padding: "64px 32px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <h2 style={{
            fontSize: "2.2rem", fontWeight: 900, marginBottom: 40,
            textAlign: "center",
          }}>
            Why <span style={{ color: "var(--lime)" }}>BidVault</span>?
          </h2>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            gap: 0,
          }}>
            {[
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                ),
                title: "Find something special",
                desc: "Discover unique objects you won't find anywhere else.",
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ),
                title: "Selected by experts",
                desc: "Our in-house experts review and appraise every object.",
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                ),
                title: "Buyer Protection",
                desc: "We make sure your payments are safe and sellers are verified.",
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                ),
                title: "Trusted by millions",
                desc: "Join a worldwide community of satisfied buyers and sellers.",
              },
            ].map(({ icon, title, desc }, i) => (
              <div key={i} style={{
                padding: "32px 32px",
                borderRight: i < 3 ? "1px solid var(--border)" : "none",
                display: "flex", flexDirection: "column", gap: 12,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "rgba(200,255,0,0.08)",
                  border: "1px solid rgba(200,255,0,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.3rem", flexShrink: 0,
                }}>{icon}</div>
                <h4 style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "1.1rem", fontWeight: 800,
                  color: "var(--text)", letterSpacing: "0.02em",
                  textTransform: "uppercase",
                }}>{title}</h4>
                <p style={{
                  color: "var(--muted)", fontSize: "0.85rem",
                  lineHeight: 1.7,
                }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "48px 32px 32px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900, fontSize: "1.8rem",
                color: "var(--text)", marginBottom: 16, letterSpacing: "0.02em",
              }}>
                BID<span style={{ color: "var(--lime)" }}>VAULT</span><span style={{ color: "var(--lime)" }}>.</span>
              </div>
              <p style={{ color: "var(--muted)", fontSize: "0.82rem", lineHeight: 1.7, maxWidth: 260 }}>
                The professional auction platform for exclusive items. Real-time bidding, transparent results.
              </p>
            </div>
            {[
              { title: "Marketplace", links: ["Live Auctions", "Past Results", "Sell With Us"] },
              { title: "Support", links: ["Authentication", "FAQ", "Contact"] },
              { title: "Legal", links: ["Terms of Service", "Privacy Policy"] },
            ].map(({ title, links }) => (
              <div key={title}>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700, fontSize: "0.72rem",
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "var(--muted)", marginBottom: 16,
                }}>{title}</div>
                {links.map((l) => (
                  <div key={l} style={{ fontSize: "0.85rem", color: "var(--text-2)", marginBottom: 10, cursor: "pointer" }}>
                    {l}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{
            borderTop: "1px solid var(--border)", paddingTop: 24,
            display: "flex", justifyContent: "space-between",
            fontSize: "0.75rem", color: "var(--muted)",
          }}>
            <span>© 2025 BidVault. All rights reserved.</span>
            <span>EST. 2025 — REAL-TIME AUCTIONS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}