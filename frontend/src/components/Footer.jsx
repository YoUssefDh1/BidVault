import { Link } from "react-router-dom";

const SOCIAL = [
  {
    label: "X / Twitter",
    href: "#",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
        <rect x="2" y="9" width="4" height="12"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "#",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
      </svg>
    ),
  },
];

const NAV_COLS = [
  { title: "Marketplace", links: [{ label: "Live Auctions", to: "/auctions" }, { label: "Past Results", to: "/auctions?status=closed" }, { label: "Sell With Us", to: "/products/create" }] },
  { title: "Support",     links: [{ label: "FAQ", to: "/faq" }, { label: "Contact", to: "#" }] },
  { title: "Legal",       links: [{ label: "Terms of Service", to: "#" }, { label: "Privacy Policy", to: "#" }] },
];

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", padding: "52px 32px 32px", background: "var(--bg)" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>

        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>

          {/* Brand */}
          <div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900, fontSize: "1.8rem",
              color: "var(--text)", marginBottom: 12, letterSpacing: "0.02em",
            }}>
              BID<span style={{ color: "var(--primary)" }}>VAULT</span><span style={{ color: "var(--primary)" }}>.</span>
            </div>
            <p style={{ color: "var(--muted)", fontSize: "0.82rem", lineHeight: 1.7, maxWidth: 260, marginBottom: 20 }}>
              The professional auction platform for exclusive items. Real-time bidding, transparent results.
            </p>
            {/* Social icons */}
            <div style={{ display: "flex", gap: 8 }}>
              {SOCIAL.map(({ label, href, icon }) => (
                <a key={label} href={href} aria-label={label} className="social-btn">
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {NAV_COLS.map(({ title, links }) => (
            <div key={title}>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700, fontSize: "0.72rem",
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: "var(--muted)", marginBottom: 16,
              }}>{title}</div>
              {links.map(({ label, to }) => (
                <Link key={label} to={to} className="footer-link" style={{ textDecoration: "none" }}>
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: "1px solid var(--border)", paddingTop: 24,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontSize: "0.75rem", color: "var(--muted)",
          flexWrap: "wrap", gap: 8,
        }}>
          <span>© {new Date().getFullYear()} BidVault. All rights reserved.</span>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}>
            EST. 2025 — REAL-TIME AUCTIONS
          </span>
        </div>

      </div>
    </footer>
  );
}
