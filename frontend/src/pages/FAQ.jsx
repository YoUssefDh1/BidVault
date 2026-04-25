import { useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";

const SECTIONS = [
  {
    title: "Getting Started",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
      </svg>
    ),
    items: [
      {
        q: "How do I create an account?",
        a: "Click Register in the top-right corner of any page. Fill in your name, email, and password. Once registered you can immediately start bidding or listing items.",
      },
      {
        q: "Is registration free?",
        a: "Yes — creating an account is completely free. There are no subscription fees. A small commission is charged only when you successfully sell an item.",
      },
      {
        q: "What can I do without an account?",
        a: "You can browse all active auctions and view lot details without signing in. Placing bids or listing items requires a registered account.",
      },
    ],
  },
  {
    title: "Bidding",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
    items: [
      {
        q: "How do I place a bid?",
        a: "Open any active auction and scroll to the bid panel on the right. Enter an amount above the current bid and click BID NOW. You must be logged in to bid.",
      },
      {
        q: "What is the minimum bid increment?",
        a: "Your bid must be at least $0.01 above the current highest bid. The bid panel shows the minimum allowed amount automatically.",
      },
      {
        q: "What happens if I'm outbid?",
        a: "You will see a real-time update in the bid panel — the price will change and a new leading bid will appear. Check your notification bell for outbid alerts.",
      },
      {
        q: "Can I retract a bid?",
        a: "Bids are binding and cannot be retracted once placed. Please review your bid amount carefully before confirming.",
      },
      {
        q: "How do I know if I won?",
        a: "When an auction closes you will see a 'Won by' notice on the lot page. Check the Won Auctions tab in your profile for your complete win history.",
      },
    ],
  },
  {
    title: "Selling & Listing",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>
      </svg>
    ),
    items: [
      {
        q: "How do I list an item for sale?",
        a: "Click '+ List Item' in the top-right navigation bar (you must be logged in). Follow the 5-step wizard: upload photos → add details → choose a category → set a schedule → review and publish.",
      },
      {
        q: "What information do I need to list?",
        a: "At minimum: at least one photo, a title, a description, a starting price, and an end date. Adding more photos and a detailed description significantly increases bidding activity.",
      },
      {
        q: "How do I set the starting price?",
        a: "You choose the starting price in Step 4 of the listing wizard. Set it at the minimum you would accept — a lower starting price usually attracts more early bids and competition.",
      },
      {
        q: "Can I edit a listing after publishing?",
        a: "Listings cannot be edited once they go live and bids have been placed. You can cancel a listing from your profile under My Listings, provided no bids have been made yet.",
      },
      {
        q: "What categories are available?",
        a: "BidVault supports: Modern Art, Automotive, Horology, Jewelry & Gems, Electronics, Fashion, Collectibles, Real Estate, Books & Manuscripts, Wine & Spirits, Musical Instruments, Gaming & Consoles, and Photography Equipment.",
      },
    ],
  },
  {
    title: "Finding Items",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
    items: [
      {
        q: "How do I search for specific items?",
        a: "Use the search bar in the center of the navigation bar. Type any keyword — lot title, artist name, model, or brand — and matching results appear instantly with image previews.",
      },
      {
        q: "How do I filter by category?",
        a: "Use the category bar just below the navigation, or open the sidebar on the Auctions page and select any category. Subcategories appear once you select a main category.",
      },
      {
        q: "Can I filter by price or status?",
        a: "Yes — on the Auctions page the left sidebar lets you filter by status (Live / Upcoming / Ended), sort by ending soon, most bids, or price, and set a minimum and maximum price range.",
      },
      {
        q: "How do I save items I'm interested in?",
        a: "Click the heart icon on any auction card or detail page to add it to your Favourites. Find all saved items under the Favourites tab in your profile.",
      },
    ],
  },
  {
    title: "Safety & Trust",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    items: [
      {
        q: "Are sellers verified?",
        a: "All sellers go through account verification before their listings go live. Our team reviews listings for accuracy and authenticity before they are published.",
      },
      {
        q: "What if a listing looks fraudulent?",
        a: "Use the Contact link in the footer to report any suspicious listing immediately. Our moderation team reviews all reports within 24 hours.",
      },
      {
        q: "Is my payment information safe?",
        a: "BidVault does not store payment card details on our servers. All payment processing is handled by certified third-party providers.",
      },
    ],
  },
];

function AccordionItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", background: "none", border: "none", cursor: "pointer",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 0", textAlign: "left", gap: 16,
        }}
      >
        <span style={{ fontSize: "0.92rem", fontWeight: 600, color: "var(--text)", lineHeight: 1.4 }}>{q}</span>
        <span style={{
          flexShrink: 0, width: 20, height: 20,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--primary)",
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.2rem",
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
          transition: "transform 0.2s ease",
        }}>+</span>
      </button>
      {open && (
        <p style={{
          fontSize: "0.88rem", color: "var(--muted)", lineHeight: 1.8,
          paddingBottom: 16, margin: 0,
        }}>{a}</p>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 32px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            border: "1px solid var(--border-strong)", borderRadius: 2,
            padding: "4px 12px", marginBottom: 20,
          }}>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700, fontSize: "0.7rem",
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "var(--primary)",
            }}>Help Center</span>
          </div>
          <h1 style={{ fontSize: "clamp(2.4rem, 5vw, 3.6rem)", fontWeight: 900, lineHeight: 1, marginBottom: 16 }}>
            Frequently Asked<br />
            <span style={{ color: "var(--primary)" }}>Questions</span>
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1rem", lineHeight: 1.7, maxWidth: 500 }}>
            Everything you need to know about bidding, selling, and managing your account on BidVault.
          </p>
        </div>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          {SECTIONS.map(({ title, icon, items }) => (
            <div key={title}>
              {/* Section header */}
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                marginBottom: 4, paddingBottom: 14,
                borderBottom: "2px solid var(--border)",
              }}>
                <span style={{ color: "var(--primary)" }}>{icon}</span>
                <h2 style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "1.1rem", fontWeight: 900,
                  letterSpacing: "0.04em", color: "var(--text)",
                }}>{title}</h2>
              </div>

              {/* Accordion items */}
              <div>
                {items.map(item => <AccordionItem key={item.q} {...item} />)}
              </div>
            </div>
          ))}
        </div>

        {/* Still need help */}
        <div style={{
          marginTop: 64, padding: "32px",
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 2, textAlign: "center",
        }}>
          <h3 style={{ fontSize: "1.3rem", fontWeight: 900, marginBottom: 10 }}>Still need help?</h3>
          <p style={{ color: "var(--muted)", fontSize: "0.88rem", lineHeight: 1.7, marginBottom: 24 }}>
            Can't find what you're looking for? Our support team is here for you.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/auctions">
              <button className="btn-primary" style={{ padding: "10px 24px" }}>Browse Auctions →</button>
            </Link>
            <Link to="/">
              <button className="btn-ghost" style={{ padding: "10px 20px" }}>Back to Home</button>
            </Link>
          </div>
        </div>

      </div>
      <Footer />
    </>
  );
}
