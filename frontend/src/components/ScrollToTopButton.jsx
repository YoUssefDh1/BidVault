import { useEffect, useState } from "react";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const [bottom, setBottom] = useState(32);

  useEffect(() => {
    const update = () => {
      setVisible(window.scrollY > 80);
      const footer = document.querySelector("footer");
      if (footer) {
        const footerTop = footer.getBoundingClientRect().top;
        const vh = window.innerHeight;
        setBottom(footerTop < vh ? vh - footerTop + 16 : 32);
      }
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  const scrollUp = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <button
      onClick={scrollUp}
      title="Back to top"
      style={{
        position: "fixed",
        right: 32,
        bottom,
        zIndex: 500,
        width: 40, height: 40,
        background: "var(--surface-2)",
        border: "1px solid var(--border-strong)",
        borderRadius: 2, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--text-2)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.2s ease, transform 0.2s ease, bottom 0.15s ease, border-color 0.15s ease, color 0.15s ease",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "var(--primary)";
        e.currentTarget.style.color = "var(--primary)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "var(--border-strong)";
        e.currentTarget.style.color = "var(--text-2)";
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7"/>
      </svg>
    </button>
  );
}
