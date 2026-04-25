import { Link } from "react-router-dom";

export default function BackToHome() {
  return (
    <Link to="/" style={{ textDecoration: "none" }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: "6px 14px",
        border: "1px solid var(--border-strong)",
        borderRadius: 2,
        fontSize: "0.78rem", color: "var(--text-2)",
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
        cursor: "pointer", transition: "all 0.15s ease",
        marginBottom: 24,
      }}
        onMouseEnter={e => {
          e.currentTarget.style.color = "var(--primary)";
          e.currentTarget.style.borderColor = "var(--primary)";
          e.currentTarget.style.background = "var(--primary-soft)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = "var(--text-2)";
          e.currentTarget.style.borderColor = "var(--border-strong)";
          e.currentTarget.style.background = "transparent";
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Back to Home
      </div>
    </Link>
  );
}