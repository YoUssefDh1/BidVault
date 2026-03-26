import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api";
import BackToHome from "../components/BackToHome";
import FavouriteButton from "../components/FavouriteButton";

function Countdown({ endDate }) {
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
  return <span>{time}</span>;
}

function AuctionCard({ auction }) {
  const product = auction.product;
  return (
    <div className="card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Image */}
      <div style={{
        width: "100%", height: 180, background: "var(--surface-2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden", position: "relative", flexShrink: 0,
      }}>
        {product.images?.[0] ? (
          <img src={`http://localhost:8000${product.images[0].url}`}
            alt={product.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: "2.5rem", opacity: 0.2 }}>🏷</span>
        )}
        {auction.status === "active" && (
          <div style={{
            position: "absolute", top: 8, left: 8,
            display: "flex", alignItems: "center", gap: 4,
            background: "rgba(0,0,0,0.85)", border: "1px solid var(--lime)",
            padding: "2px 7px", borderRadius: 2,
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "0.62rem", fontWeight: 700,
            letterSpacing: "0.1em", color: "var(--lime)",
          }}>
            <span className="live-dot" style={{ width: 5, height: 5 }} /> LIVE
          </div>
        )}
        <div style={{ position: "absolute", top: 8, right: 8 }}>
          <FavouriteButton auctionId={auction.id} size={15} />
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", flex: 1 }}>
        {product.category && (
          <div style={{
            fontSize: "0.62rem", color: "var(--muted)", fontFamily: "'Barlow Condensed', sans-serif",
            letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3,
          }}>{product.category.name}</div>
        )}
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: 3, lineHeight: 1.2 }}>
          {product.title}
        </h3>
        <p style={{
          fontSize: "0.76rem", color: "var(--muted)", marginBottom: 12, lineHeight: 1.5, flex: 1,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }} dangerouslySetInnerHTML={{ __html: product.description || "" }} />

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-end",
          borderTop: "1px solid var(--border)", paddingTop: 10, marginBottom: 10,
        }}>
          <div>
            <div style={{ fontSize: "0.6rem", color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif" }}>Current Bid</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.15rem", color: "var(--text)" }}>
              ${product.current_price?.toLocaleString()}
            </div>
          </div>
          {auction.status === "active" && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.6rem", color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif" }}>Ends In</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "0.95rem", color: "var(--lime)" }}>
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
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 32px" }}>
        <BackToHome />

      {/* Top bar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "28px 0 20px", borderBottom: "1px solid var(--border)",
      }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 900 }}>
          {search ? `Results for "${search}"` : "Trending Lots"}
          <span style={{ fontSize: "1rem", color: "var(--muted)", marginLeft: 14, fontFamily: "'Barlow', sans-serif", fontWeight: 400, textTransform: "none" }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 0 }}>

        {/* ── Sidebar ── */}
        <div style={{
          borderRight: "1px solid var(--border)",
          padding: "28px 24px 28px 0",
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
                  color: active ? "var(--lime)" : "var(--text-2)",
                  cursor: "pointer", fontWeight: active ? 600 : 400,
                  borderLeft: active ? "2px solid var(--lime)" : "2px solid transparent",
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
                      color: active ? "var(--lime)" : "var(--muted)",
                      cursor: "pointer", fontWeight: active ? 600 : 400,
                      borderLeft: active ? "2px solid var(--lime)" : "2px solid transparent",
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
                    border: `2px solid ${active ? "var(--lime)" : "var(--border-2)"}`,
                    background: active ? "var(--lime)" : "transparent",
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
                    color: active ? "var(--lime)" : "var(--muted)",
                    fontWeight: active ? 600 : 400,
                    borderLeft: active ? "2px solid var(--lime)" : "2px solid transparent",
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
                style={{ fontSize: "0.72rem", color: "var(--lime)", cursor: "pointer", paddingLeft: 2 }}>
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
        <div style={{ padding: "28px 0 28px 28px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 80, color: "var(--muted)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Loading lots...
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
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: 1,
            }}>
              {auctions.map((a) => <AuctionCard key={a.id} auction={a} />)}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}