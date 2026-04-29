import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api";
import BackToHome from "../components/BackToHome";
import FavouriteButton from "../components/FavouriteButton";
import Footer from "../components/Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";

function Countdown({ endDate }) {
  const [time, setTime] = useState("");
  const [timerClass, setTimerClass] = useState("timer-normal");
  useEffect(() => {
    const tick = () => {
      const diff = new Date(endDate) - new Date();
      if (diff <= 0) { setTime("ENDED"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      
      // Dynamic timer coloring based on urgency
      if (diff < 60000) {
        setTimerClass("timer-danger");
      } else if (diff < 300000) {
        setTimerClass("timer-warning");
      } else {
        setTimerClass("timer-normal");
      }
      
      setTime(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);
  return <span className={timerClass}>{time}</span>;
}

function AuctionCard({ auction }) {
  const product = auction.product;
  return (
    <div className="card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Image */}
      <div style={{
        width: "100%", height: 210, background: "var(--surface-2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden", position: "relative", flexShrink: 0,
      }}>
        {product.images?.[0] ? (
          <img src={`${api.defaults.baseURL}${product.images[0].url}`}
            alt={product.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: "2.5rem", opacity: 0.2 }}>🏷</span>
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
            padding: "2px 7px", borderRadius: 2,
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "0.62rem", fontWeight: 700,
            letterSpacing: "0.1em", color: "var(--primary)",
          }}>
            <span className="live-dot" style={{ width: 5, height: 5 }} /> LIVE
          </div>
        )}
        <div style={{ position: "absolute", top: 8, right: 8 }}>
          <FavouriteButton auctionId={auction.id} size={15} />
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", flex: 1 }}>
        {product.category && (
          <div style={{
            fontSize: "0.68rem", color: "var(--text-secondary)", marginBottom: 4,
          }}>{product.category.name}</div>
        )}
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: 4, lineHeight: 1.2 }}>
          {product.title}
        </h3>
        <p style={{
          fontSize: "0.82rem", color: "var(--muted)", marginBottom: 12, lineHeight: 1.6, flex: 1,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }} dangerouslySetInnerHTML={{ __html: product.description || "" }} />

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-end",
          borderTop: "1px solid var(--border)", paddingTop: 10, marginBottom: 10,
        }}>
          <div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>Current Bid</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.15rem", color: "var(--text)" }}>
              ${product.current_price?.toLocaleString()}
            </div>
          </div>
          {auction.status === "active" && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>Ends In</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "0.95rem" }}>
                <Countdown endDate={auction.end_date} />
              </div>
            </div>
          )}
        </div>

        <Link to={`/auctions/${auction.id}`} style={{ textDecoration: "none" }}>
          <button className="btn-ghost" style={{ width: "100%", textAlign: "center", padding: "8px", fontSize: "0.78rem" }}>
            PLACE BID
          </button>
        </Link>
      </div>
    </div>
  );
}

export default function AuctionList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [auctions, setAuctions]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]     = useState(true);

  // All filter state lives in the URL — derive from it
  const search            = searchParams.get("search")         || "";
  const statusFilter      = searchParams.get("status")         || "";
  const categoryFilter    = searchParams.get("category_id")    || "";
  const subcategoryFilter = searchParams.get("subcategory_id") || "";
  const sortBy            = searchParams.get("sort_by")        || "";
  const minPrice          = searchParams.get("min_price")      || "";
  const maxPrice          = searchParams.get("max_price")      || "";

  // Local price inputs (only applied on blur/enter)
  const [minInput, setMinInput] = useState(minPrice);
  const [maxInput, setMaxInput] = useState(maxPrice);

  // Active category object (for subcategories)
  const activeCat = categories.find(c => c.id?.toString() === categoryFilter) || null;

  const setFilter = (key, value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });
  };

  const clearFilters = () => setSearchParams({});

  useEffect(() => {
    api.get("/categories").then(({ data }) => setCategories(data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search)            params.append("search",         search);
    if (statusFilter)      params.append("status",         statusFilter);
    if (categoryFilter)    params.append("category_id",    categoryFilter);
    if (subcategoryFilter) params.append("subcategory_id", subcategoryFilter);
    if (minPrice)          params.append("min_price",      minPrice);
    if (maxPrice)          params.append("max_price",      maxPrice);
    if (sortBy)            params.append("sort_by",        sortBy);
    api.get(`/auctions?${params}`)
      .then(({ data }) => setAuctions(data))
      .finally(() => setLoading(false));
  }, [search, statusFilter, categoryFilter, subcategoryFilter, minPrice, maxPrice, sortBy]);

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 32px 0" }}>
        <BackToHome />

      {/* Top bar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "28px 0 20px", borderBottom: "1px solid var(--border)",
      }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 900 }}>
          {search ? `Results for "${search}"` : "Trending Lots"}
          <span style={{ fontSize: "1rem", color: "var(--muted)", marginLeft: 14, fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif", fontWeight: 400, textTransform: "none" }}>
            {auctions.length} results
          </span>
        </h1>
        {search && (
          <button className="btn-ghost" onClick={() => setFilter("search", "")}
            style={{ fontSize: "0.78rem", padding: "7px 16px" }}>
            ✕ Clear search
          </button>
        )}
      </div>

      <div className="auction-layout">

        {/* ── Sidebar ── */}
        <div className="auction-sidebar" style={{
          borderRight: "1px solid var(--border)",
          padding: "32px 28px 32px 0",
          minHeight: "70vh",
        }}>
          {/* Categories */}
          <div style={{ marginBottom: 32 }}>
            <div style={{
              fontSize: "0.68rem", color: "var(--muted)",
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: "0.12em", textTransform: "uppercase",
              marginBottom: 12, fontWeight: 700,
            }}>Categories</div>
            {[{ id: "", name: "All Assets" }, ...categories].map((c) => {
              const val = c.id?.toString() || "";
              const active = categoryFilter === val;
              return (
                <div key={val} onClick={() => {
                  setSearchParams(prev => {
                    const next = new URLSearchParams(prev);
                    if (val) next.set("category_id", val); else next.delete("category_id");
                    next.delete("subcategory_id"); // reset subcategory when switching category
                    return next;
                  });
                }} style={{
                  padding: "6px 0", fontSize: "0.85rem",
                  color: active ? "var(--primary)" : "var(--text-2)",
                  cursor: "pointer", fontWeight: active ? 600 : 400,
                  borderLeft: active ? "2px solid var(--primary)" : "2px solid transparent",
                  paddingLeft: 10, transition: "all 0.15s",
                }}>
                  {c.name}
                </div>
              );
            })}
          </div>

          {/* Subcategories — shown when a category is active */}
          {activeCat?.subcategories?.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div style={{
                fontSize: "0.68rem", color: "var(--muted)",
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: "0.12em", textTransform: "uppercase",
                marginBottom: 12, fontWeight: 700,
              }}>{activeCat.name}</div>
              {[{ id: "", name: "All" }, ...activeCat.subcategories].map((s) => {
                const val = s.id?.toString() || "";
                const active = subcategoryFilter === val;
                return (
                  <div key={val} onClick={() => setFilter("subcategory_id", val)}
                    style={{
                      padding: "5px 0", fontSize: "0.82rem",
                      color: active ? "var(--primary)" : "var(--muted)",
                      cursor: "pointer", fontWeight: active ? 600 : 400,
                      borderLeft: active ? "2px solid var(--primary)" : "2px solid transparent",
                      paddingLeft: 10, transition: "all 0.15s",
                    }}>
                    {s.name}
                  </div>
                );
              })}
            </div>
          )}

          {/* Status */}
          <div style={{ marginBottom: 32 }}>
            <div style={{
              fontSize: "0.68rem", color: "var(--muted)",
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: "0.12em", textTransform: "uppercase",
              marginBottom: 12, fontWeight: 700,
            }}>Status</div>
            {[
              { value: "", label: "All" },
              { value: "active", label: "Live Now" },
              { value: "scheduled", label: "Upcoming" },
              { value: "closed", label: "Ended" },
            ].map(({ value, label }) => {
              const active = statusFilter === value;
              return (
                <div key={value} onClick={() => setFilter("status", value)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", cursor: "pointer" }}>
                  <div style={{
                    width: 12, height: 12, borderRadius: "50%",
                    border: `2px solid ${active ? "var(--primary)" : "var(--border-strong)"}`,
                    background: active ? "var(--primary)" : "transparent",
                    transition: "all 0.15s", flexShrink: 0,
                  }} />
                  <span style={{
                    fontSize: "0.85rem", color: active ? "var(--text)" : "var(--muted)",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    {value === "active" && <span className="live-dot" style={{ width: 5, height: 5 }} />}
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Sort By */}
          <div style={{ marginBottom: 32 }}>
            <div style={{
              fontSize: "0.68rem", color: "var(--muted)",
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: "0.12em", textTransform: "uppercase",
              marginBottom: 12, fontWeight: 700,
            }}>Sort By</div>
            {[
              { value: "",             label: "Default" },
              { value: "ending_soon",  label: "⏳ Ending Soon" },
              { value: "most_bids",    label: "🔥 Most Bids" },
              { value: "newest",       label: "✨ Newly Listed" },
              { value: "price_asc",    label: "↑ Price: Low to High" },
              { value: "price_desc",   label: "↓ Price: High to Low" },
            ].map(({ value, label }) => {
              const active = sortBy === value;
              return (
                <div key={value} onClick={() => setFilter("sort_by", value)}
                  style={{
                    padding: "5px 0 5px 10px", fontSize: "0.82rem", cursor: "pointer",
                    color: active ? "var(--primary)" : "var(--muted)",
                    fontWeight: active ? 600 : 400,
                    borderLeft: active ? "2px solid var(--primary)" : "2px solid transparent",
                    transition: "all 0.15s",
                  }}>
                  {label}
                </div>
              );
            })}
          </div>

          {/* Price Range */}
          <div style={{ marginBottom: 32 }}>
            <div style={{
              fontSize: "0.68rem", color: "var(--muted)",
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: "0.12em", textTransform: "uppercase",
              marginBottom: 12, fontWeight: 700,
            }}>Price Range ($)</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                className="input"
                type="number" placeholder="Min"
                value={minInput}
                onChange={e => setMinInput(e.target.value)}
                onBlur={() => setFilter("min_price", minInput)}
                onKeyDown={e => e.key === "Enter" && setFilter("min_price", minInput)}
                style={{ padding: "7px 10px", fontSize: "0.8rem", width: "50%" }}
              />
              <input
                className="input"
                type="number" placeholder="Max"
                value={maxInput}
                onChange={e => setMaxInput(e.target.value)}
                onBlur={() => setFilter("max_price", maxInput)}
                onKeyDown={e => e.key === "Enter" && setFilter("max_price", maxInput)}
                style={{ padding: "7px 10px", fontSize: "0.8rem", width: "50%" }}
              />
            </div>
            {(minPrice || maxPrice) && (
              <div onClick={() => { setMinInput(""); setMaxInput(""); setSearchParams(prev => { const next = new URLSearchParams(prev); next.delete("min_price"); next.delete("max_price"); return next; }); }}
                style={{ fontSize: "0.72rem", color: "var(--primary)", cursor: "pointer", paddingLeft: 2 }}>
                ✕ Clear price
              </div>
            )}
          </div>

          {(search || statusFilter || categoryFilter || subcategoryFilter || sortBy || minPrice || maxPrice) && (
            <button onClick={() => { setMinInput(""); setMaxInput(""); clearFilters(); }}
              className="btn-ghost" style={{ width: "100%", fontSize: "0.75rem", padding: "7px" }}>
              Clear All Filters
            </button>
          )}
        </div>

        {/* ── Grid ── */}
        <div style={{ padding: "32px 0 32px 32px" }}>
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
              {[...Array(9)].map((_, i) => (
                <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <div className="skeleton" style={{ height: 180, flexShrink: 0 }} />
                  <div style={{ padding: "12px 14px", flex: 1 }}>
                    <div className="skeleton" style={{ height: 10, width: "40%", marginBottom: 6 }} />
                    <div className="skeleton" style={{ height: 14, width: "85%", marginBottom: 6 }} />
                    <div className="skeleton" style={{ height: 10, width: "70%", marginBottom: 16 }} />
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                      <div className="skeleton" style={{ height: 18, width: "38%" }} />
                      <div className="skeleton" style={{ height: 18, width: "28%" }} />
                    </div>
                    <div className="skeleton" style={{ height: 34, width: "100%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : auctions.length === 0 ? (
            <div className="card" style={{ padding: 60, textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: 12, opacity: 0.3 }}>🔍</div>
              <h3 style={{ marginBottom: 8, fontSize: "1.4rem" }}>No Lots Found</h3>
              <p style={{ color: "var(--muted)" }}>Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="animate-stagger" style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 24,
            }}>
              {auctions.map((a) => <AuctionCard key={a.id} auction={a} />)}
            </div>
          )}
        </div>

      </div>
      <ScrollToTopButton />
      <Footer />
    </div>
  );
}