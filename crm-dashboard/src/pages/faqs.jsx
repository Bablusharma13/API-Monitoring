"use client";

import { useEffect, useState, useMemo } from "react";


const API_URL = import.meta.env.VITE_PUBLIC_FAQ_URL || 'https://backend-docs.allheartweb.info/api/docs/get-all-docs-by-specificType/Syberfort/faqs';
const breadcrumb = [
  { name: "Dashboard", href: "/" },
  { name: "Support", href: "/support" },
  { name: "Faq", href: "", current: true },
];

/* ─────────────────────────────────────────────────────────────────────────
   ICON MAP  — keyed by lowercase category / subCategory name
   Add more entries here as your API returns new categories
   ───────────────────────────────────────────────────────────────────────── */
const ICON_MAP = {
  all: {
    color: "#6366f1",
    svg: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </>
    ),
  },
  account: {
    color: "#0ea5e9",
    svg: (
      <>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
  },
  billing: {
    color: "#ec4899",
    svg: (
      <>
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </>
    ),
  },
  "billing and payment": {
    color: "#ec4899",
    svg: (
      <>
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </>
    ),
  },
  api: {
    color: "#f97316",
    svg: (
      <>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </>
    ),
  },
  "api & data": {
    color: "#f97316",
    svg: (
      <>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </>
    ),
  },
  support: {
    color: "#ef4444",
    svg: (
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    ),
  },
  privacy: {
    color: "#8b5cf6",
    svg: (
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    ),
  },
  security: {
    color: "#8b5cf6",
    svg: (
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    ),
  },
  whois: {
    color: "#0ea5e9",
    svg: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </>
    ),
  },
  "whois data": {
    color: "#0ea5e9",
    svg: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </>
    ),
  },
  download: {
    color: "#10b981",
    svg: (
      <>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </>
    ),
  },
  "my downloads": {
    color: "#10b981",
    svg: (
      <>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </>
    ),
  },
  pricing: {
    color: "#f59e0b",
    svg: (
      <>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </>
    ),
  },
  data: {
    color: "#6366f1",
    svg: (
      <>
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </>
    ),
  },
  database: {
    color: "#6366f1",
    svg: (
      <>
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </>
    ),
  },
  technical: {
    color: "#f97316",
    svg: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93l-1.41 1.41M5.34 17.66l-1.41 1.41M2 12h2M20 12h2M19.07 19.07l-1.41-1.41M5.34 6.34L3.93 4.93M12 2v2M12 20v2" />
      </>
    ),
  },
  lookup: {
    color: "#0ea5e9",
    svg: (
      <>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </>
    ),
  },
  general: {
    color: "#6b7280",
    svg: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </>
    ),
  },
};

const FALLBACK_ICON = {
  color: "#6b7280",
  svg: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </>
  ),
};

function getIcon(label = "") {
  return ICON_MAP[label.toLowerCase().trim()] || FALLBACK_ICON;
}

/* ── Reusable SVG icon ──────────────────────────────────────────────────── */
function CatIcon({ label, size = 12 }) {
  const { color, svg } = getIcon(label);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      {svg}
    </svg>
  );
}

/* ── FAQ Item accordion ─────────────────────────────────────────────────── */
const FaqItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e9ebf0",
        borderRadius: 10,
        overflow: "hidden",
        marginBottom: 8,
      }}
    >
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          cursor: "pointer",
          gap: 12,
          background: open ? "#f9fafb" : "#fff",
          userSelect: "none",
          transition: "background .1s",
        }}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.background = "#f9fafb";
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.background = "#fff";
        }}
      >
        {/* Q icon + text */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            fontSize: 13.5,
            color: "#000",
            fontWeight: 400,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6366f1"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          {question}
        </div>

        {/* Chevron */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6b7280"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            flexShrink: 0,
            transition: "transform .2s",
            transform: open ? "rotate(180deg)" : "rotate(0)",
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {open && (
        <div
          style={{
            borderTop: "1px solid #e9ebf0",
            padding: "14px 18px 14px 42px",
            fontSize: 13.5,
            color: "#6b7280",
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {answer}
        </div>
      )}
    </div>
  );
};

/* ── Section heading with matching icon ─────────────────────────────────── */
const SecTitle = ({ label, isFirst = false }) => {
  const { color, svg } = getIcon(label);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontFamily: "'Outfit', sans-serif",
        fontSize: 16,
        fontWeight: 400,
        color: "#000",
        marginBottom: 12,
        marginTop: isFirst ? 0 : 24,
      }}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {svg}
      </svg>
      {label}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   Main FAQ page
   ═══════════════════════════════════════════════════════════════════════════ */
export default function Faq() {
  useEffect(() => {
    document.title = "Frequently Asked Questions - Whois Data Center";
    return () => {
      document.title = "Frequently Asked Questions - Whois Data Center";
    };
  }, []);

  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("all");

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_URL, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const json = await res.json();

        if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
          setError("No FAQs available.");
          setLoading(false);
          return;
        }

        const flatFaqs = [];
        const catMap = new Map(); // slug → name (insertion-ordered)

        json.data.forEach((doc) => {
          const catName = doc.categoryDetail?.[0]?.name || "General";
          const catSlug = doc.categoryDetail?.[0]?.slug || "general";
          const subCategory = doc.subCategory || catName;

          if (!catMap.has(catSlug)) catMap.set(catSlug, catName);

          let items = [];
          try { items = JSON.parse(doc.content); } catch {}

          items.forEach((item, i) => {
            flatFaqs.push({
              id: `${doc._id}-${i}`,
              category: catSlug,
              categoryName: catName,
              subCategory,
              question: item.question,
              answer: item.answer,
            });
          });
        });

        const builtCats = [
          { id: "all", label: "All" },
          ...Array.from(catMap.entries()).map(([slug, name]) => ({
            id: slug,
            label: name,
          })),
        ];

        setFaqs(flatFaqs);
        setCategories(builtCats);
        setError(flatFaqs.length === 0 ? "No FAQs available." : "");
      } catch (err) {
        setError("Failed to load FAQs. Please try again later.");
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return faqs.filter(
      (f) =>
        (activeCat === "all" || f.category === activeCat) &&
        (!q ||
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q))
    );
  }, [faqs, search, activeCat]);

  const grouped = useMemo(() => {
    const groups = new Map();
    filtered.forEach((f) => {
      if (!groups.has(f.subCategory)) groups.set(f.subCategory, []);
      groups.get(f.subCategory).push(f);
    });
    return groups;
  }, [filtered]);

  const hasFaqs = filtered.length > 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Outfit:wght@400;500&display=swap');

        .faq-root * { box-sizing: border-box; }

        .faq-search-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          border: 1px solid #e9ebf0;
          border-radius: 8px;
          padding: 11px 16px;
          width: 100%;
          max-width: 480px;
          margin-bottom: 28px;
          transition: border-color .14s;
        }
        .faq-search-wrap:focus-within { border-color: #2563eb; }
        .faq-search-wrap svg { color: #6b7280; flex-shrink: 0; opacity: .5; }
        .faq-search-wrap input {
          border: none;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #1c1f2e;
          background: transparent;
          width: 100%;
          font-weight: 400;
        }
        .faq-search-wrap input::placeholder { color: #c2c8d4; }

        .cat-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 28px; }
        .cat-tab {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 16px;
          border: 1px solid #e9ebf0;
          border-radius: 20px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 400;
          color: #6b7280;
          cursor: pointer;
          background: #fff;
          transition: all .14s;
        }
        .cat-tab:hover {
          border-color: #2563eb;
          color: #2563eb;
          background: #eff4ff;
        }
        .cat-tab.act {
          border-color: #2563eb;
          color: #2563eb;
          background: #eff4ff;
        }

        .faq-no-results {
          text-align: center;
          padding: 48px 0;
          color: #6b7280;
          font-size: 13.5px;
          font-family: 'DM Sans', sans-serif;
        }
      `}</style>

      <div
        className="faq-root"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          color: "#1c1f2e",
          fontSize: 14,
          minHeight: "100vh",
        }}
      >
        <div> 
         Frequently Asked Questions
          {/* Loading */}
          {loading && (
           
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading.. </p>
            </div>
        
          )}

          {/* Error */}
          {error && !loading && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <p style={{ color: "#dc2626", marginBottom: 14, fontSize: 13 }}>{error}</p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: "8px 18px",
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: 7,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Main content */}
          {!loading && !error && (
            <>
              {/* Search */}
              <div className="faq-search-wrap mt-[28px]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search questions…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Tabs — dynamic with matched icons */}
              <div className="cat-tabs">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`cat-tab${activeCat === cat.id ? " act" : ""}`}
                    onClick={() => setActiveCat(cat.id)}
                  >
                    <CatIcon
                      label={cat.id === "all" ? "all" : cat.label}
                      size={12}
                    />
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* No results */}
              {!hasFaqs && (
                <div className="faq-no-results">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                    stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ margin: "0 auto 12px", display: "block" }}>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  No questions found matching your search.
                </div>
              )}

              {/* FAQ groups */}
              {hasFaqs &&
                Array.from(grouped.entries()).map(([subCat, items], gi) => (
                  <div key={subCat}>
                    <SecTitle label={subCat} isFirst={gi === 0} />
                    {items.map((f) => (
                      <FaqItem key={f.id} question={f.question} answer={f.answer} />
                    ))}
                  </div>
                ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}