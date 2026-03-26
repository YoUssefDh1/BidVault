const s = (active) => ({
  width: 22, height: 22, viewBox: "0 0 24 24", fill: "none",
  stroke: active ? "var(--lime)" : "var(--muted)",
  strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round",
  style: { transition: "stroke 0.2s ease" },
});

const CAT_SVG_ICONS = {
  "Modern Art": ({ active } = {}) => (
    <svg {...s(active)}>
      <circle cx="13.5" cy="6.5" r="2.5"/><circle cx="19" cy="13" r="2.5"/>
      <circle cx="6.5" cy="13.5" r="2.5"/><circle cx="12" cy="20" r="2.5"/>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" strokeDasharray="2 2"/>
    </svg>
  ),
  "Automotive": ({ active } = {}) => (
    <svg {...s(active)}>
      <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14l3 4v4a2 2 0 0 1-2 2h-2"/>
      <circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>
    </svg>
  ),
  "Horology": ({ active } = {}) => (
    <svg {...s(active)}>
      <circle cx="12" cy="12" r="7"/>
      <polyline points="12 9 12 12 13.5 13.5"/>
      <path d="M9 2h6M9 22h6"/>
    </svg>
  ),
  "Jewelry & Gems": ({ active } = {}) => (
    <svg {...s(active)}>
      <path d="M6 3h12l4 6-10 13L2 9z"/>
      <path d="M2 9h20M6 3l4 6m4 0 4-6"/>
    </svg>
  ),
  "Electronics": ({ active } = {}) => (
    <svg {...s(active)}>
      <rect x="4" y="4" width="16" height="12" rx="2"/>
      <path d="M8 20h8M12 16v4"/>
      <circle cx="12" cy="10" r="2"/>
    </svg>
  ),
  "Fashion": ({ active } = {}) => (
    <svg {...s(active)}>
      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>
    </svg>
  ),
  "Collectibles": ({ active } = {}) => (
    <svg {...s(active)}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  "Real Estate": ({ active } = {}) => (
    <svg {...s(active)}>
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>
      <path d="M9 21V12h6v9"/>
    </svg>
  ),
  "Books & Manuscripts": ({ active } = {}) => (
    <svg {...s(active)}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      <line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="14" y2="11"/>
    </svg>
  ),
  "Wine & Spirits": ({ active } = {}) => (
    <svg {...s(active)}>
      <path d="M8 22h8M12 11v11M7 2h10l-1.68 8.39A3 3 0 0 1 12.4 13h-.8a3 3 0 0 1-2.92-2.61L7 2z"/>
    </svg>
  ),
  "Musical Instruments": ({ active } = {}) => (
    <svg {...s(active)}>
      <path d="M9 18V5l12-2v13"/>
      <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
    </svg>
  ),
  "Gaming & Consoles": ({ active } = {}) => (
    <svg {...s(active)}>
      <line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/>
      <circle cx="15" cy="11" r="1"/><circle cx="17" cy="13" r="1"/>
      <path d="M3 7h18a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/>
    </svg>
  ),
  "Photography Equipment": ({ active } = {}) => (
    <svg {...s(active)}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  ),
};

export default CAT_SVG_ICONS;