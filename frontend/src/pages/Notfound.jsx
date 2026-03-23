import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "80vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: "40px 32px",
      position: "relative", overflow: "hidden",
    }}>

      {/* Background glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 50% 40%, rgba(200,255,0,0.04) 0%, transparent 65%)",
      }} />

      {/* Big 404 */}
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 900,
        fontSize: "clamp(8rem, 20vw, 18rem)",
        lineHeight: 0.9,
        color: "transparent",
        WebkitTextStroke: "2px rgba(200,255,0,0.15)",
        userSelect: "none",
        marginBottom: 16,
        letterSpacing: "-0.04em",
      }}>404</div>

      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 900, fontSize: "1.8rem",
        textTransform: "uppercase", letterSpacing: "0.06em",
        marginBottom: 12,
      }}>
        Lot Not Found
      </div>

      <p style={{
        color: "var(--muted)", fontSize: "0.95rem",
        lineHeight: 1.7, maxWidth: 360, marginBottom: 36,
      }}>
        This page doesn't exist or the auction has been removed.
        Head back to the catalog and find something rare.
      </p>

      <div style={{ display: "flex", gap: 12 }}>
        <Link to="/auctions">
          <button className="btn-primary" style={{ padding: "11px 28px", fontSize: "0.88rem" }}>
            Browse Auctions →
          </button>
        </Link>
        <Link to="/">
          <button className="btn-ghost" style={{ padding: "11px 24px", fontSize: "0.88rem" }}>
            Go Home
          </button>
        </Link>
      </div>

    </div>
  );
}