import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import useAuthStore from "../store/authStore";
import CAT_SVG_ICONS from "../components/CategoryIcons";
import CategoryBar from "../components/CategoryBar";
import Footer from "../components/Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";

// CategoryBar is imported from ../components/CategoryBar

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
            <img
              src={`${api.defaults.baseURL}${product.images[0].url}`}
              alt={product.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", opacity: 0.2 }}>🏷</div>
          )}
          {/* Bottom gradient so badges stay readable over any image */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 56,
            background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)",
            pointerEvents: "none",
          }} />
          {auction.status === "active" && (
            <div style={{
              position: "absolute", top: 8, left: 8,
              display: "flex", alignItems: "center", gap: 4,
              background: "rgba(0,0,0,0.85)", border: "1px solid var(--primary)",
              padding: "2px 7px", borderRadius: 1,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", color: "var(--primary)",
            }}>
              <span className="live-dot" style={{ width: 5, height: 5 }} /> LIVE
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 4, lineHeight: 1.2 }}>{product.title}</h3>
          <p style={{
            fontSize: "0.82rem", color: "var(--muted)", marginBottom: 12, lineHeight: 1.6, flex: 1,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }} dangerouslySetInnerHTML={{ __html: product.description || "" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>Current Bid</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.2rem" }}>
                ${product.current_price?.toLocaleString()}
              </div>
            </div>
            {auction.status === "active" && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>Ends In</div>
                <Countdown endDate={auction.end_date} style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
                  fontSize: "0.95rem", color: "var(--primary)",
                }} />
              </div>
            )}
          </div>

          <div style={{
            width: "100%", padding: "9px", textAlign: "center",
            background: "transparent", border: "1px solid var(--border-strong)",
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
          <img
            src={`${api.defaults.baseURL}${product.images[0].url}`}
            alt={product.title}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%", objectFit: "cover",
              filter: "brightness(0.35)",
            }}
          />
        )}

        {/* Viewers badge top right */}
        <div style={{
          position: "absolute", top: 16, right: 16,
          background: "rgba(0,0,0,0.7)", border: "1px solid var(--border-strong)",
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
            color: "var(--primary)", marginBottom: 8,
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
          }} dangerouslySetInnerHTML={{ __html: product.description || "" }} />

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
              background: "var(--primary)", color: "var(--bg)",
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
function TickerItems({ items, suffix }) {
  return (
    <>
      {items.map((a, i) => (
        <span key={`${suffix}-${i}`} style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          paddingRight: 40, whiteSpace: "nowrap",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.06em",
        }}>
          <span style={{ color: "var(--border-strong)", fontSize: "0.55rem" }}>◆</span>
          <span style={{ color: "var(--text-2)" }}>{a.product?.title}</span>
          <span style={{ color: "var(--primary)", fontWeight: 900 }}>
            ${a.product?.current_price?.toLocaleString()}
          </span>
        </span>
      ))}
    </>
  );
}

function Ticker({ auctions }) {
  const items = auctions.slice(0, 8);
  if (!items.length) return null;

  return (
    <div style={{
      display: "flex", alignItems: "center",
      background: "var(--surface)",
      borderTop: "1px solid var(--border)",
      borderBottom: "1px solid var(--border)",
      height: 36, overflow: "hidden",
    }}>
      {/* Pinned label */}
      <div style={{
        flexShrink: 0, display: "flex", alignItems: "center", gap: 6,
        padding: "0 16px", height: "100%",
        borderRight: "1px solid var(--border)",
        background: "var(--surface-2)",
      }}>
        <span className="live-dot" style={{ width: 5, height: 5 }} />
        <span style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 800, fontSize: "0.68rem",
          letterSpacing: "0.12em", textTransform: "uppercase",
          color: "var(--primary)", whiteSpace: "nowrap",
        }}>Live Bids</span>
      </div>

      {/* Scrolling track */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div className="ticker-track">
          <TickerItems items={items} suffix="a" />
          <TickerItems items={items} suffix="b" />
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function Home() {
  const [auctions, setAuctions] = useState([]);
  const [, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const { role, token } = useAuthStore();

  useEffect(() => {
    api.get("/auctions?status=active").then(({ data }) => {
      setAuctions(data);
      const hottest = [...data].sort((a, b) => (b.bid_count || 0) - (a.bid_count || 0))[0] || null;
      setFeatured(hottest);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Ensure the page is at the top when Home mounts/refreshed
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-unused-vars
      try { window.history.scrollRestoration = "manual"; } catch (e) { /* empty */ }
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <div>
      {/* ── CATEGORY BAR ─────────────────────────────────────── */}
      <CategoryBar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <div style={{
        position: "relative", minHeight: "calc(100vh - 169px)",
        display: "flex", alignItems: "center",
        borderBottom: "1px solid var(--border)",
        overflow: "hidden",
      }}>
        {/* Subtle background grain */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 60% 50%, rgba(136,192,208,0.03) 0%, transparent 60%)",
          pointerEvents: "none",
        }} />

        {/* Hero text — full width, left aligned */}
        <div style={{ position: "relative", zIndex: 2, padding: "20px 48px", maxWidth: 1400, width: "100%", margin: "0 auto" }}>
          <div className="animate-fade-up" style={{ maxWidth: 680 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              border: "1px solid var(--border-strong)", borderRadius: 2,
              padding: "4px 12px", marginBottom: 16,
            }}>
              <span className="live-dot" />
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700, fontSize: "0.72rem",
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: "var(--primary)",
              }}>Live Market Open</span>
            </div>

            <h1 style={{
              fontSize: "clamp(5rem, 9vw, 10rem)",
              fontWeight: 900, lineHeight: 0.92,
              marginBottom: 20, color: "var(--text)",
            }}>
              Bid Smart.<br />
              {" "}
              <span style={{ color: "transparent", WebkitTextStroke: "2px var(--text)" }}>
                 Win Faster.
              </span>
            </h1>

            <p style={{
              color: "var(--muted)", fontSize: "1.15rem",
              maxWidth: 420, lineHeight: 1.7, marginBottom: 24,
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
                  <button className="btn-outline-lime" style={{ fontSize: "0.9rem", padding: "12px 28px" }}>
                    + List an Item
                  </button>
                </Link>
              )}
              {!token && (
                <button className="btn-outline-lime"
                  style={{ fontSize: "0.9rem", padding: "12px 28px" }}
                  onClick={() => document.dispatchEvent(new CustomEvent("open-auth", { detail: "register" }))}>
                  Start Selling →
                </button>
              )}
            </div>
          </div>
        </div>

      {/* Hero image — full background */}
<img src="/hero.png" alt="hero" style={{
  position: "absolute", inset: 0,
  width: "100%", height: "100%",
  objectFit: "cover",
  opacity: 1,
  pointerEvents: "none",
  userSelect: "none",
  zIndex: 0,
}} />

{/* Gradient overlay so text stays readable */}
<div style={{
  position: "absolute", inset: 0,
  background: "linear-gradient(to right, rgba(0,0,0,0.85) 40%, rgba(0,0,0,0.2) 100%)",
  zIndex: 1,
  pointerEvents: "none",
}} />

        {/* Featured hero card removed per request */}
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", overflow: "hidden" }}>
                <div className="skeleton" style={{ height: 200, width: "100%" }} />
                <div style={{ padding: "14px 16px" }}>
                  <div className="skeleton" style={{ height: 13, width: "65%", marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 10, width: "90%", marginBottom: 6 }} />
                  <div className="skeleton" style={{ height: 10, width: "75%", marginBottom: 20 }} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <div className="skeleton" style={{ height: 18, width: "35%" }} />
                    <div className="skeleton" style={{ height: 18, width: "25%" }} />
                  </div>
                  <div className="skeleton" style={{ height: 32, width: "100%" }} />
                </div>
              </div>
            ))}
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
            gap: 16,
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
                background: "var(--text)", color: "var(--bg)",
                border: "1px solid var(--border)",
              }}>
                <h3 style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "2rem", fontWeight: 900,
                  marginBottom: 12, lineHeight: 1,
                  color: "var(--bg)",
                }}>
                  LIST YOUR<br />COLLECTION
                </h3>
                <p style={{ fontSize: "0.82rem", marginBottom: 24, lineHeight: 1.6, color: "var(--text-secondary)", maxWidth: 200 }}>
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
            Why <span style={{ color: "var(--primary)" }}>BidVault</span>?
          </h2>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            gap: 0,
          }}>
            {[
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                ),
                title: "Find something special",
                desc: "Discover unique objects you won't find anywhere else.",
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ),
                title: "Selected by experts",
                desc: "Our in-house experts review and appraise every object.",
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                ),
                title: "Buyer Protection",
                desc: "We make sure your payments are safe and sellers are verified.",
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
                  background: "rgba(136,192,208,0.08)",
                  border: "1px solid rgba(136,192,208,0.2)",
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

      <ScrollToTopButton />
      <Footer />
    </div>
  );
}