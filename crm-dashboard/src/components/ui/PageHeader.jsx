// PageHeader.jsx
// Usage:
// <PageHeader
//   icon={<svg .../>}          ← icon inside the gradient badge
//   iconGradient="from-cyan-500 to-blue-600"   ← optional, defaults shown
//   title="Rating of Domains"
//   breadcrumbs={[
//     { label: "Dashboard", href: "#" },
//     { label: "Ratings",   href: "#" },
//     { label: "Rating of Domains" },   ← last item has no href
//   ]}
//   actions={<button>...</button>}      ← optional right-side slot
// />

export default function PageHeader({
  icon,
  iconGradient = "",
  title,
  breadcrumbs = [],
  actions,
}) {
  return (
    <div>
      {/* ── Title row ── */}
      <div className="pageheader-container">
        <h1 className="pageheader-title">
          {/* Gradient icon badge */}
          {icon && (
            <span
              className={`pageheader-icon bg-gradient-to-br ${iconGradient}`}
            >
              {icon}
            </span>
          )}

          {title}
        </h1>
        {actions && <div className="pageheader-actions">{actions}</div>}
      </div>

      {/* ── Breadcrumb ── */}
      {breadcrumbs.length > 0 && (
        <nav className="pageheader-breadcrumb">
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            return (
              <span key={i} className="pageheader-breadcrumb-item">
                {i > 0 && <span className="pageheader-breadcrumb-sep">›</span>}
                {isLast ? (
                  <span className="pageheader-breadcrumb-active">
                    {crumb.label}
                  </span>
                ) : (
                  <a
                    href={crumb.href || "#"}
                    className="pageheader-breadcrumb-link"
                  >
                    {crumb.label}
                  </a>
                )}
              </span>
            );
          })}
        </nav>
      )}
    </div>
  );
}
