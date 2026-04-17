import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api";
import CategoryBar from "../components/CategoryBar";
import CAT_SVG_ICONS from "../components/CategoryIcons";

export default function CategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/categories/${id}`)
      .then(({ data }) => setCategory(data))
      .catch(() => navigate("/auctions"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <>
      <CategoryBar />
      <div style={{ textAlign: "center", padding: 80, color: "var(--muted)", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        Loading...
      </div>
    </>
  );

  if (!category) return null;

  const IconFn = CAT_SVG_ICONS[category.name];

  return (
    <>
      <CategoryBar />

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 32px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
          <Link to="/auctions" style={{ textDecoration: "none" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--muted)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>
              Auctions
            </span>
          </Link>
          <span style={{ color: "var(--border-2)", fontSize: "0.8rem" }}>›</span>
          <span style={{ fontSize: "0.78rem", color: "var(--text)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {category.name}
          </span>
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: "rgba(136,192,208,0.08)",
            border: "1px solid rgba(136,192,208,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            {IconFn ? IconFn({ active: true }) : null}
          </div>
          <div>
            <h1 style={{ fontSize: "2.4rem", fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>
              {category.name}
            </h1>
            {category.description && (
              <p style={{ color: "var(--muted)", fontSize: "0.88rem" }}>{category.description}</p>
            )}
          </div>
          {/* Browse all in this category */}
          <div style={{ marginLeft: "auto" }}>
            <Link to={`/auctions?category_id=${category.id}`}>
              <button className="btn-ghost" style={{ fontSize: "0.82rem", padding: "9px 20px" }}>
                View all in {category.name} →
              </button>
            </Link>
          </div>
        </div>

        {/* Subcategory grid */}
        {category.subcategories?.length > 0 ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 1,
          }}>
            {category.subcategories.map((sub) => (
              <Link
                key={sub.id}
                to={`/auctions?category_id=${category.id}&subcategory_id=${sub.id}`}
                style={{ textDecoration: "none" }}
              >
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "22px 24px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  transition: "border-color 0.15s, background 0.15s",
                  gap: 16,
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "var(--primary)";
                    e.currentTarget.style.background = "rgba(136,192,208,0.03)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.background = "var(--surface)";
                  }}
                >
                  <div>
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 800, fontSize: "1.05rem",
                      textTransform: "uppercase", letterSpacing: "0.04em",
                      marginBottom: 4, color: "var(--text)",
                    }}>
                      {sub.name}
                    </div>
                    {sub.description && (
                      <div style={{ fontSize: "0.78rem", color: "var(--muted)", lineHeight: 1.5 }}>
                        {sub.description}
                      </div>
                    )}
                  </div>
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 900, fontSize: "1.4rem",
                    color: "var(--muted)", flexShrink: 0,
                    transition: "color 0.15s",
                  }}>›</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 60, color: "var(--muted)" }}>
            No subcategories — browsing all items in {category.name}
          </div>
        )}
      </div>
    </>
  );
}