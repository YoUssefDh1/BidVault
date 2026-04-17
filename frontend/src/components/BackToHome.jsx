import { Link } from "react-router-dom";

export default function BackToHome() {
  return (
    <Link to="/" style={{ textDecoration: "none" }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontSize: "0.72rem", color: "var(--muted)",
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
        cursor: "pointer", transition: "color 0.15s",
        marginBottom: 24,
      }}
        onMouseEnter={e => e.currentTarget.style.color = "var(--primary)"}
        onMouseLeave={e => e.currentTarget.style.color = "var(--muted)"}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Back to Home
      </div>
    </Link>
  );
}