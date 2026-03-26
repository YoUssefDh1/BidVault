import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api";
import CAT_SVG_ICONS from "./CategoryIcons";

export default function CategoryBar() {
  const [categories, setCategories] = useState([]);
  const [canLeft,  setCanLeft]      = useState(false);
  const [canRight, setCanRight]     = useState(true);
  const navigate  = useNavigate();
  const location  = useLocation();
  const scrollRef = useRef(null);

  // Derive active category from current URL
  const match = location.pathname.match(/^\/category\/(\d+)/);
  const activeCatId = match ? parseInt(match[1]) : null;

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
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [categories]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth / 2), behavior: "smooth" });
  };

  const handleCat = (cat) => {
    if (!cat) { navigate("/auctions"); return; }
    // If it has subcategories → go to category page
    // If no subcategories → go straight to filtered auctions
    if (cat.subcategories?.length > 0) {
      navigate(`/category/${cat.id}`);
    } else {
      navigate(`/auctions?category_id=${cat.id}`);
    }
  };

  if (!categories.length) return null;

  return (
    <div style={{
      borderBottom: "1px solid var(--border)",
      background: "rgba(0,0,0,0.97)",
      position: "sticky", top: 60, zIndex: 90,
    }}>
      <div style={{ position: "relative" }}>
        <div ref={scrollRef} style={{
          maxWidth: 1400, margin: "0 auto", padding: "0 32px",
          display: "flex", alignItems: "center",
          overflowX: "auto", scrollbarWidth: "none",
          msOverflowStyle: "none", scrollBehavior: "smooth",
        }}>

          {/* Left arrow */}
          {canLeft && (
            <div onClick={() => scroll(-1)} style={{
              position: "sticky", left: 0, flexShrink: 0, zIndex: 3,
              height: "100%", display: "flex", alignItems: "center",
              paddingRight: 8,
              background: "linear-gradient(to right, rgba(0,0,0,1) 60%, transparent)",
              cursor: "pointer",
            }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.6rem", color: "var(--lime)", lineHeight: 1, userSelect: "none" }}>‹</span>
            </div>
          )}

          {/* All */}
          <div onClick={() => handleCat(null)} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 6, padding: "14px 20px", cursor: "pointer", flexShrink: 0,
            borderBottom: !activeCatId ? "2px solid var(--lime)" : "2px solid transparent",
            transition: "all 0.2s ease", transform: "translateY(0)",
          }}
            onMouseEnter={e => {
              if (activeCatId) {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.borderBottomColor = "rgba(200,255,0,0.3)";
              }
            }}
            onMouseLeave={e => {
              if (activeCatId) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderBottomColor = "transparent";
              }
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke={!activeCatId ? "var(--lime)" : "var(--muted)"}
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase",
              color: !activeCatId ? "var(--lime)" : "var(--muted)", transition: "color 0.15s",
            }}>All</span>
          </div>

          {/* Categories */}
          {categories.map((cat) => {
            const isActive = activeCatId === cat.id;
            const IconFn   = CAT_SVG_ICONS[cat.name];
            return (
              <div key={cat.id} onClick={() => handleCat(cat)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 6, padding: "14px 20px", cursor: "pointer", flexShrink: 0,
                  borderBottom: isActive ? "2px solid var(--lime)" : "2px solid transparent",
                  transition: "all 0.2s ease",
                  transform: "translateY(0)",
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.borderBottomColor = "rgba(200,255,0,0.3)";
                    const label = e.currentTarget.querySelector("span");
                    if (label) label.style.color = "var(--text-2)";
                    const svg = e.currentTarget.querySelector("svg");
                    if (svg) svg.setAttribute("stroke", "var(--text-2)");
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderBottomColor = "transparent";
                    const label = e.currentTarget.querySelector("span");
                    if (label) label.style.color = "var(--muted)";
                    const svg = e.currentTarget.querySelector("svg");
                    if (svg) svg.setAttribute("stroke", "var(--muted)");
                  }
                }}
              >
                {IconFn ? IconFn({ active: isActive }) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke={isActive ? "var(--lime)" : "var(--muted)"}
                    strokeWidth="1.8" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                )}
                <span style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                  fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase",
                  color: isActive ? "var(--lime)" : "var(--muted)",
                  whiteSpace: "nowrap", transition: "color 0.2s",
                }}>{cat.name}</span>
              </div>
            );
          })}

          {/* Right arrow */}
          {canRight && (
            <div onClick={() => scroll(1)} style={{
              position: "sticky", right: 0, flexShrink: 0, zIndex: 3,
              height: "100%", display: "flex", alignItems: "center",
              paddingLeft: 8,
              background: "linear-gradient(to left, rgba(0,0,0,1) 60%, transparent)",
              cursor: "pointer",
            }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.6rem", color: "var(--lime)", lineHeight: 1, userSelect: "none" }}>›</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}