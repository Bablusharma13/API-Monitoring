import { useState, useEffect, useRef, useCallback } from "react";
import PageHeader from "../components/ui/PageHeader";
import { EditIcon, RefreshIcon } from "../components/ui/Icons";
import { ActionButton } from "../components/ui/ActionButton";
import { StatCard } from "../components/ui/StatCard3";
import { Badge } from "../components/ui/Badge";
import { Table } from "../components/TableComponents/Table";
import { Section } from "../components/ui/Section";

// ── INITIAL DATA ──────────────────────────────────────────────────────────────
const INITIAL_BUFFERS = [
  {
    id: "buf-1",
    name: "Buffer 1",
    route: "Ingest → Parser",
    fill: 28,
    cap: 50000,
    warn: 60,
    crit: 85,
    in: 24800,
    out: 24600,
    peak: 44,
    overflows: 0,
    lag: 0,
    status: "ok",
    policy: "Drop oldest",
    backpressure: "Signal producer",
    color: "#2563eb",
  },
  {
    id: "buf-2",
    name: "Buffer 2",
    route: "Parser → Enricher",
    fill: 62,
    cap: 50000,
    warn: 60,
    crit: 85,
    in: 24600,
    out: 22100,
    peak: 78,
    overflows: 1,
    lag: 14,
    status: "warn",
    policy: "Drop oldest",
    backpressure: "Signal producer",
    color: "#16a34a",
  },
  {
    id: "buf-3",
    name: "Buffer 3",
    route: "Enricher → Router",
    fill: 79,
    cap: 100000,
    warn: 60,
    crit: 85,
    in: 22100,
    out: 22000,
    peak: 91,
    overflows: 2,
    lag: 38,
    status: "crit",
    policy: "DLQ fallback",
    backpressure: "Signal producer",
    color: "#d97706",
  },
  {
    id: "buf-4",
    name: "Buffer 4",
    route: "Router → Writer",
    fill: 18,
    cap: 50000,
    warn: 60,
    crit: 85,
    in: 22000,
    out: 21980,
    peak: 26,
    overflows: 0,
    lag: 0,
    status: "ok",
    policy: "Drop oldest",
    backpressure: "Signal producer",
    color: "#0891b2",
  },
];

const OVERFLOW_EVENTS = [
  {
    time: "14:22:09",
    buf: "Buffer 3",
    dropped: 8,
    peak: "91%",
    action: "DLQ fallback",
  },
  {
    time: "14:08:44",
    buf: "Buffer 3",
    dropped: 3,
    peak: "88%",
    action: "DLQ fallback",
  },
  {
    time: "13:51:17",
    buf: "Buffer 2",
    dropped: 1,
    peak: "82%",
    action: "Drop oldest",
  },
  {
    time: "14:08:44",
    buf: "Buffer 3",
    dropped: 3,
    peak: "88%",
    action: "DLQ fallback",
  },
];

const DLQ_INITIAL = [
  { name: "dlq-001", count: 8, age: "22m ago", pct: 67 },
  { name: "dlq-002", count: 3, age: "8m ago", pct: 25 },
  { name: "dlq-003", count: 1, age: "3m ago", pct: 8 },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────
function gaugeColor(status) {
  if (status === "crit") return "#dc2626";
  if (status === "warn") return "#d97706";
  return "#16a34a";
}

function statusLabel(status) {
  if (status === "crit")
    return {
      label: "Critical",
      cls: "bg-red-50 text-red-600 border border-red-200",
    };
  if (status === "warn")
    return {
      label: "Warning",
      cls: "bg-amber-50 text-amber-600 border border-amber-200",
    };
  return {
    label: "Healthy",
    cls: "bg-green-50 text-green-600 border border-green-200",
  };
}

// ── SVG RING GAUGE ────────────────────────────────────────────────────────────
function RingGauge({ pct, status }) {
  const r = 42,
    cx = 54,
    cy = 54;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = gaugeColor(status);
  return (
    <div className="relative w-24 h-24 mx-auto mb-3">
      <svg viewBox="0 0 108 108" className="w-full h-full">
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#f0f2f7"
          strokeWidth="10"
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{
            transition: "stroke-dasharray 0.8s ease",
            strokeDashoffset: 0,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-outfit text-xl font-normal leading-none"
          style={{ color }}
        >
          {pct}%
        </span>
        <span className="text-[10px] text-gray-400 mt-0.5">fill</span>
      </div>
    </div>
  );
}

// ── SPARKLINE BARS ────────────────────────────────────────────────────────────
function SparkBars({ history, color }) {
  const max = Math.max(...history, 1);
  return (
    <div className="flex items-end gap-0.5 h-12 mt-2.5 pt-1.5 border-t border-black/5">
      {history.map((v, i) => {
        const h = Math.max(6, Math.round((v / max) * 100));
        const c = v >= 85 ? "#dc2626" : v >= 60 ? "#d97706" : color;
        return (
          <div
            key={i}
            className="flex-1 rounded-t-sm min-w-[3px] opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
            style={{ height: `${h}%`, background: c }}
            title={`${Math.round(v)}%`}
          />
        );
      })}
    </div>
  );
}

// ── BUFFER GAUGE CARD ─────────────────────────────────────────────────────────
function BufCard({ b, onToast }) {
  const history = Array.from({ length: 30 }, (_, i) =>
    Math.max(4, b.fill + (Math.random() - 0.5) * 30),
  );

  history[history.length - 1] = b.fill;

  const cardCls =
    b.status === "crit"
      ? "border-red-200 bg-red-50"
      : b.status === "warn"
        ? "border-amber-200 bg-amber-50"
        : "border-gray-200 bg-white";

  const badgeVariant =
    b.status === "crit" ? "down" : b.status === "warn" ? "warning" : "active";

  const badgeValue =
    b.status === "crit"
      ? "Critical"
      : b.status === "warn"
        ? "Warning"
        : "Healthy";

  return (
    <div
      className={`rounded-xl border p-4 cursor-pointer transition-shadow hover:shadow-lg ${cardCls}`}
      onClick={() => onToast(`${b.name} · ${b.fill}% full · ${b.lag}ms lag`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-sm font-medium text-gray-800">{b.name}</div>
          <div className="text-[11.5px] text-gray-400 mt-0.5">{b.route}</div>
        </div>
        <Badge value={badgeValue} variant={badgeVariant} />
      </div>

      <RingGauge pct={Math.round(b.fill)} status={b.status} />

      <div className="grid grid-cols-2 sm:grid-cols-2 gap-1.5 mt-3">
        {[
          { val: `${(b.in / 1000).toFixed(1)}k/s`, lbl: "In", col: "#16a34a" },
          {
            val: `${(b.out / 1000).toFixed(1)}k/s`,
            lbl: "Out",
            col: "#2563eb",
          },
          {
            val: `${b.lag}ms`,
            lbl: "Lag",
            col: b.lag > 20 ? "#dc2626" : b.lag > 5 ? "#d97706" : "#1c1f2e",
          },
          {
            val: `${b.peak}%`,
            lbl: "Peak",
            col:
              b.peak >= 85 ? "#dc2626" : b.peak >= 60 ? "#d97706" : "#1c1f2e",
          },
        ].map(({ val, lbl, col }) => (
          <div
            key={lbl}
            className="px-2.5 py-1.5 bg-white/70 border border-black/[.06] rounded-lg"
          >
            <div className="font-mono text-[13px]" style={{ color: col }}>
              {val}
            </div>
            <div className="text-[10.5px] text-gray-400">{lbl}</div>
          </div>
        ))}
      </div>

      <SparkBars history={history} color={b.color} />
    </div>
  );
}

// ── FILL HISTORY CANVAS CHART ─────────────────────────────────────────────────
function FillChart() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.offsetWidth || 600;
    canvas.width = W;
    const H = canvas.height;
    const pts = 60;
    const series = [
      { base: 28, vol: 12, col: "#2563eb" },
      { base: 62, vol: 18, col: "#16a34a" },
      { base: 79, vol: 15, col: "#d97706" },
      { base: 18, vol: 10, col: "#0891b2" },
    ];
    const data = series.map((s) =>
      Array.from({ length: pts }, (_, i) => {
        const spike = s.base > 70 && i > 45 && i < 52 ? s.base + 15 : 0;
        return Math.min(
          100,
          Math.max(0, s.base + spike + (Math.random() - 0.5) * s.vol),
        );
      }),
    );
    ctx.clearRect(0, 0, W, H);
    [60, 85].forEach((pct, i) => {
      const y = H - (pct / 100) * (H - 20) - 10;
      ctx.strokeStyle = i === 0 ? "#fde68a" : "#fecaca";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = i === 0 ? "#d97706" : "#dc2626";
      ctx.font = "10px DM Mono, monospace";
      ctx.fillText(pct + "%", W - 28, y - 3);
    });
    [25, 50, 75, 100].forEach((pct) => {
      const y = H - (pct / 100) * (H - 20) - 10;
      ctx.strokeStyle = "#f0f2f7";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
      ctx.fillStyle = "#c2c8d4";
      ctx.font = "10px DM Mono";
      ctx.textAlign = "left";
      ctx.fillText(pct + "%", 4, y - 3);
    });
    data.forEach((d, si) => {
      const points = d.map((v, i) => ({
        x: (i / (pts - 1)) * W,
        y: H - (v / 100) * (H - 20) - 10,
      }));
      ctx.beginPath();
      ctx.moveTo(points[0].x, H - 10);
      points.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.lineTo(points[pts - 1].x, H - 10);
      ctx.closePath();
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, series[si].col + "28");
      g.addColorStop(1, series[si].col + "04");
      ctx.fillStyle = g;
      ctx.fill();
      ctx.beginPath();
      points.forEach((p, i) =>
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y),
      );
      ctx.strokeStyle = series[si].col;
      ctx.lineWidth = 1.8;
      ctx.lineJoin = "round";
      ctx.stroke();
    });
  }, []);

  return <canvas ref={canvasRef} height={130} className="w-full" />;
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
function Toast({ message }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#1c1f2e] text-white px-4 py-2.5 rounded-lg text-[13px] shadow-xl transition-opacity duration-300"
      style={{
        opacity: message ? 1 : 0,
        pointerEvents: message ? "auto" : "none",
        maxWidth: 360,
      }}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#6ee7b7"
        strokeWidth="2.5"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {message}
    </div>
  );
}

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export default function BufferDashboard() {
  const [buffers, setBuffers] = useState(
    INITIAL_BUFFERS.map((b) => ({ ...b })),
  );
  const [toast, setToast] = useState("");
  const [toastTimer, setToastTimer] = useState(null);
  const [overflows] = useState(OVERFLOW_EVENTS);
  const [dlq] = useState(DLQ_INITIAL);
  const [timeWindow, setTimeWindow] = useState("Last 1 hour");

  const showToast = useCallback(
    (msg) => {
      setToast(msg);
      if (toastTimer) clearTimeout(toastTimer);
      const t = setTimeout(() => setToast(""), 2600);
      setToastTimer(t);
    },
    [toastTimer],
  );

  const flushAll = () => {
    setBuffers((prev) =>
      prev.map((b) => ({
        ...b,
        fill: Math.round(b.fill * 0.3),
        status: "ok",
        lag: 0,
      })),
    );
    showToast("All buffers flushed — levels reset");
  };

  // Live tick
  useEffect(() => {
    const id = setInterval(() => {
      setBuffers((prev) =>
        prev.map((b, i) => {
          const delta = (Math.random() - 0.5) * 6;
          const fill = Math.max(5, Math.min(98, b.fill + delta));
          const status = fill >= 85 ? "crit" : fill >= 60 ? "warn" : "ok";
          const lag =
            i === 2
              ? Math.round(30 + Math.random() * 20)
              : i === 1
                ? Math.round(8 + Math.random() * 14)
                : 0;
          return { ...b, fill, status, lag };
        }),
      );
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const avgFill = Math.round(
    buffers.reduce((s, b) => s + b.fill, 0) / buffers.length,
  );
  const maxLag = Math.max(...buffers.map((b) => b.lag));
  const tput = (24 + Math.random() * 2).toFixed(1);

  return (
    <div
      className="font-dm-sans text-[14px] text-gray-800 container-page"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Main */}
      <div className=" ">
        {/* Page Header */}
        <div className="pb-4 flex-shrink-0">
          {/* Title + action buttons */}
          <div className="flex items-center justify-between gap-4">
            <PageHeader
              className="flex flex-col gap-1.5"
              icon={
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="1.8"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 7V5a2 2 0 0 0-4 0v2" />
                  <line x1="12" y1="12" x2="12" y2="16" />
                </svg>
              }
              iconGradient="bg-transparent"
              title="Buffer Dashboard"
              breadcrumbs={[
                { label: "Dashboard", href: "#" },
                { label: "Pipeline", href: "#" },
                { label: "Buffer Dashboard" },
              ]}
            />

            <div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-[12px] text-gray-400 bg-white border border-gray-200 rounded-md px-3 py-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                  Live · refreshes every{" "}
                  <span className="font-mono text-gray-700 ml-0.5">2s</span>
                </div>
                <select
                  className="border border-gray-200 rounded-md px-2.5 py-1.5 font-[inherit] text-[12px] text-gray-700 bg-white cursor-pointer outline-none"
                  value={timeWindow}
                  onChange={(e) => {
                    setTimeWindow(e.target.value);
                    showToast("Window: " + e.target.value);
                  }}
                >
                  {[
                    "Last 15 min",
                    "Last 1 hour",
                    "Last 6 hours",
                    "Last 24 hours",
                  ].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>

                <ActionButton
                  action="save"
                  onClick={() => showToast("Buffer thresholds configured")}
                  label={"Thresholds"}
                  icon={SearchIcon}
                />

                <ActionButton
                  action="search"
                  onClick={flushAll}
                  label={"Flush All"}
                  icon={RefreshIcon}
                />
              </div>

              <div className="flex items-center justify-end gap-1.5 pt-1.5 text-[11.5px]">
                <span className="ml-auto flex items-center gap-2 text-[11.5px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
                  <span className="text-red-600">1 buffer critical</span>
                  <span className="text-gray-200">·</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                  <span className="text-amber-600">1 warning</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Page Body */}
        <div className="" style={{ scrollbarWidth: "thin" }}>
          <Section>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-6">
              <StatCard
                icon={<BufferKpiIcon />}
                iconColor="text-blue-600"
                count="4"
                countColor="text-blue-600"
                title="Total Buffers"
              />
              <StatCard
                icon={<WarnKpiIcon />}
                iconColor="text-amber-600"
                count={avgFill + "%"}
                countColor="text-amber-600"
                title="Avg Fill Level"
              />
              <StatCard
                icon={<AlertKpiIcon />}
                iconColor="text-red-600"
                count="3"
                countColor="text-red-600"
                title="Overflows (1h)"
              />
              <StatCard
                icon={<TrashKpiIcon />}
                iconColor="text-red-600"
                count="12"
                countColor="text-red-600"
                title="Dropped (1h)"
              />
              <StatCard
                icon={<ClockKpiIcon />}
                iconColor="text-purple-700"
                count={`+${maxLag}ms`}
                countColor="text-purple-700"
                title="Max Consumer Lag"
              />
              <StatCard
                icon={<TputKpiIcon />}
                iconColor="text-green-600"
                count={`${tput}k`}
                countColor="text-green-600"
                title="Total Throughput/s"
              />
            </div>
          </Section>

          <Section>
            {/* Buffer Gauge Cards */}
            <SectionLabel>Live Buffer Levels</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
              {buffers.map((b) => (
                <BufCard key={b.id} b={b} onToast={showToast} />
              ))}
            </div>
          </Section>

          <Section>
            {/* Consumer Lag + Overflow Events */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {/* Consumer Lag */}
              <Card
                title={
                  <>
                    <ClockIcon2 />
                    &nbsp;Consumer Lag per Buffer
                  </>
                }
                right={
                  <span className="text-[11px] text-gray-400">
                    Target: &lt;5ms
                  </span>
                }
              >
                <div className="-mx-4 -my-2">
                  <Table
                    columns={[
                      {
                        id: "name",
                        name: "Buffer",
                        width: 80,
                        cell: (row) => (
                          <span className="font-medium text-[12.5px]">
                            {row.name}
                          </span>
                        ),
                      },
                      {
                        id: "route",
                        name: "Route",
                        width: 130,
                        cell: (row) => (
                          <span className="text-[12px] text-gray-400">
                            {row.route}
                          </span>
                        ),
                      },
                      {
                        id: "lag",
                        name: "Lag",
                        width: 50,
                        cell: (row) => {
                          const c =
                            row.lag > 20
                              ? "#dc2626"
                              : row.lag > 5
                                ? "#d97706"
                                : "#16a34a";
                          const fill = Math.min(100, (row.lag / 50) * 100);
                          return (
                            <div className="flex items-center gap-0">
                              <div className="w-[100px] h-1.5 bg-gray-100 rounded-full overflow-hidden mr-2 inline-block">
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${fill}%`, background: c }}
                                />
                              </div>
                              <span
                                className="font-mono text-[12.5px]"
                                style={{ color: c }}
                              >
                                {row.lag === 0 ? "<1ms" : row.lag + "ms"}
                              </span>
                            </div>
                          );
                        },
                      },
                      {
                        id: "trend",
                        name: "Trend",
                        width: 80,
                        cell: (row) =>
                          row.lag > 10 ? (
                            <span className="text-red-500 text-[12px]">
                              ↑ Rising
                            </span>
                          ) : (
                            <span className="text-gray-400 text-[12px]">
                              → Stable
                            </span>
                          ),
                      },
                      {
                        id: "status",
                        name: "Status",
                        width: 80,
                        cell: (row) => {
                          const badgeVariant =
                            row.status === "crit"
                              ? "down"
                              : row.status === "warn"
                                ? "warning"
                                : "active";
                          const badgeValue =
                            row.status === "crit"
                              ? "Critical"
                              : row.status === "warn"
                                ? "Warning"
                                : "Healthy";
                          return (
                            <Badge value={badgeValue} variant={badgeVariant} />
                          );
                        },
                      },
                    ]}
                    tableName="consumer-lag"
                    data={buffers}
                    loading={false}
                    enableSearch={false}
                    pageIndex={0}
                    setPageIndex={() => {}}
                    pageLimit={buffers.length}
                    setPageLimit={() => {}}
                    paginationData={{
                      totalCount: buffers.length,
                      totalPages: 1,
                    }}
                    sortField={null}
                    setSortField={() => {}}
                    sortType={null}
                    setSortType={() => {}}
                    activeFilters={{}}
                    setActiveFilters={() => {}}
                  />
                </div>
              </Card>

              {/* Overflow Events */}
              <Card
                title={
                  <>
                    <WarnIcon2 />
                    &nbsp;Overflow Events
                  </>
                }
                right={
                  <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                    3 in last 1h
                  </span>
                }
              >
                <div className="-mx-4 -my-2">
                  <Table
                    columns={[
                      {
                        id: "time",
                        name: "Time",
                        width: 100,
                        cell: (row) => (
                          <span className="font-mono text-[11.5px] text-gray-400">
                            {row.time}
                          </span>
                        ),
                      },
                      {
                        id: "buf",
                        name: "Buffer",
                        width: 110,
                        cell: (row) => <Badge value={row.buf} variant="down" />,
                      },
                      {
                        id: "dropped",
                        name: "Dropped",
                        width: 90,
                        cell: (row) => (
                          <span className="font-mono text-[13px] text-red-600">
                            {row.dropped}
                          </span>
                        ),
                      },
                      {
                        id: "peak",
                        name: "Peak Fill",
                        width: 100,
                        cell: (row) => (
                          <span className="font-mono text-[12px] text-amber-600">
                            {row.peak}
                          </span>
                        ),
                      },
                      {
                        id: "action",
                        name: "Action",
                        width: 130,
                        cell: (row) => (
                          <Badge value={row.action} variant="category" />
                        ),
                      },
                    ]}
                    tableName="overflow-events"
                    data={overflows}
                    loading={false}
                    enableSearch={false}
                    pageIndex={0}
                    setPageIndex={() => {}}
                    pageLimit={overflows.length}
                    setPageLimit={() => {}}
                    paginationData={{
                      totalCount: overflows.length,
                      totalPages: 1,
                    }}
                    onRowClick={(row) =>
                      showToast(`Overflow: ${row.buf} at ${row.time}`)
                    }
                    sortField={null}
                    setSortField={() => {}}
                    sortType={null}
                    setSortType={() => {}}
                    activeFilters={{}}
                    setActiveFilters={() => {}}
                  />
                </div>
              </Card>
            </div>
          </Section>

          <Section>
            {/* Fill History + DLQ */}
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 mb-6">
              {/* Fill History */}
              <Card
                title={
                  <>
                    <ActivityIcon2 />
                    &nbsp;Buffer Fill History — Last 1h
                  </>
                }
                right={
                  <div className="flex gap-3 text-[11.5px] items-center">
                    {[
                      ["#2563eb", "Buf 1"],
                      ["#16a34a", "Buf 2"],
                      ["#d97706", "Buf 3"],
                      ["#0891b2", "Buf 4"],
                    ].map(([c, l]) => (
                      <span key={l} className="flex items-center gap-1">
                        <span
                          className="w-2 h-2 rounded-sm inline-block"
                          style={{ background: c }}
                        />
                        {l}
                      </span>
                    ))}
                  </div>
                }
              >
                <div className="px-1 pb-1">
                  <FillChart />
                  <div className="flex justify-between mt-1.5">
                    {["1h ago", "45m", "30m", "15m", "Now"].map((t) => (
                      <span key={t} className="text-[11px] text-gray-400">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>

              {/* DLQ */}
              <Card
                title={
                  <>
                    <TrashIcon2 />
                    &nbsp;Dead-Letter Queue
                  </>
                }
                right={
                  <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                    12 pending
                  </span>
                }
              >
                <div className="-mx-4 -mt-1">
                  {dlq.map((d) => (
                    <div
                      key={d.name}
                      className="flex items-center px-4 py-2.5 border-b border-gray-100 last:border-b-0 hover:bg-blue-50/40 cursor-pointer transition-colors"
                      onClick={() => showToast(`Opening ${d.name}`)}
                    >
                      <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                      <div className="text-[13px] font-medium text-gray-800 flex-1 ml-2.5">
                        {d.name}
                      </div>
                      <div className="w-20 h-1 bg-gray-100 rounded-full overflow-hidden mx-3">
                        <div
                          className="h-full rounded-full bg-red-400 opacity-70"
                          style={{ width: `${d.pct}%` }}
                        />
                      </div>
                      <div className="font-mono text-[13px] text-red-600 w-10 text-right">
                        {d.count}
                      </div>
                      <div className="text-[11.5px] text-gray-400 w-16 text-right">
                        {d.age}
                      </div>
                      <button
                        className="w-6 h-6 ml-2 flex items-center justify-center border border-gray-200 rounded-md hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          showToast(`Retrying ${d.name}…`);
                        }}
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="23 4 23 10 17 10" />
                          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-3 border-t border-gray-200 mt-2 -mx-0">
                  <ActionButton
                    action="search"
                    onClick={() => showToast("Retrying 12 DLQ entries…")}
                    label="Retry All"
                    icon={RefreshIcon}
                  />
                  <ActionButton
                    action="delete"
                    onClick={() => showToast("DLQ purged")}
                    label="Purge DLQ"
                    icon={null}
                  />
                </div>
              </Card>
            </div>
          </Section>

          <Section>
            {/* Config Table */}
            <SectionLabel>Buffer Configuration</SectionLabel>
            <Card
              title={
                <>
                  <SettingsIcon />
                  &nbsp;Configuration &amp; Thresholds
                </>
              }
              right={
                <ActionButton
                  action="export"
                  onClick={() => showToast("Config saved")}
                  label="Edit"
                  icon={EditIcon}
                />
              }
            >
              <div className="-mx-4 -my-2">
                <Table
                  columns={[
                    {
                      id: "name",
                      name: "Buffer",
                      width: 110,
                      cell: (row) => (
                        <span className="font-medium">{row.name}</span>
                      ),
                    },
                    {
                      id: "route",
                      name: "Route",
                      width: 180,
                      cell: (row) => (
                        <span className="text-[12px] text-gray-400">
                          {row.route}
                        </span>
                      ),
                    },
                    {
                      id: "cap",
                      name: "Capacity",
                      width: 110,
                      cell: (row) => (
                        <span className="font-mono text-[12px]">
                          {(row.cap / 1000).toFixed(0)}k msgs
                        </span>
                      ),
                    },
                    {
                      id: "warn",
                      name: "Warn Threshold",
                      width: 140,
                      cell: (row) => (
                        <span className="font-mono text-[12px] text-amber-600">
                          {row.warn}%
                        </span>
                      ),
                    },
                    {
                      id: "crit",
                      name: "Crit Threshold",
                      width: 140,
                      cell: (row) => (
                        <span className="font-mono text-[12px] text-red-600">
                          {row.crit}%
                        </span>
                      ),
                    },
                    {
                      id: "policy",
                      name: "Overflow Policy",
                      width: 150,
                      cell: (row) => (
                        <Badge value={row.policy} variant="category" />
                      ),
                    },
                    {
                      id: "backpressure",
                      name: "Backpressure",
                      width: 160,
                      cell: (row) => (
                        <span className="text-[12.5px] text-gray-400">
                          {row.backpressure}
                        </span>
                      ),
                    },
                  ]}
                  tableName="buffer-config"
                  data={buffers}
                  loading={false}
                  enableSearch={false}
                  pageIndex={0}
                  setPageIndex={() => {}}
                  pageLimit={buffers.length}
                  setPageLimit={() => {}}
                  paginationData={{
                    totalCount: buffers.length,
                    totalPages: 1,
                  }}
                  sortField={null}
                  setSortField={() => {}}
                  sortType={null}
                  setSortType={() => {}}
                  activeFilters={{}}
                  setActiveFilters={() => {}}
                />
              </div>
            </Card>
          </Section>
        </div>
      </div>

      <Toast message={toast} />
    </div>
  );
}

// ── LAYOUT HELPERS ────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-gray-400 mb-3">
      {children}
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

function Card({ title, right, children }) {
  return (
    <div className=" overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50/60">
        <div className="text-[13px] text-gray-700 font-medium flex items-center gap-1.5 opacity-90">
          {title}
        </div>
        {right}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ── ICONS ─────────────────────────────────────────────────────────────────────
const ic = (d) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    {d}
  </svg>
);
const GridIcon = () =>
  ic(
    <>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </>,
  );
const ActivityIcon = () =>
  ic(<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />);
const AlertIcon = () =>
  ic(
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </>,
  );
const FileIcon = () =>
  ic(
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </>,
  );
const PipeIcon = () =>
  ic(
    <>
      <rect x="2" y="8" width="4" height="8" rx="1" />
      <rect x="10" y="5" width="4" height="14" rx="1" />
      <rect x="18" y="10" width="4" height="6" rx="1" />
      <line x1="6" y1="12" x2="10" y2="12" />
      <line x1="14" y1="12" x2="18" y2="12" />
    </>,
  );
const BufferIcon = () =>
  ic(
    <>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-4 0v2" />
      <line x1="12" y1="12" x2="12" y2="16" />
    </>,
  );
const SearchIcon = () =>
  ic(
    <>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </>,
  );
const TraceIcon = () =>
  ic(
    <>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      <circle cx="5" cy="12" r="2" />
    </>,
  );
const StorageIcon = () =>
  ic(
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
    </>,
  );
const ClockIcon = () =>
  ic(
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </>,
  );
const MonitorIcon = ({ color }) => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" />
  </svg>
);
const UserIcon = ({ color }) => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
  </svg>
);

const kpic = (d, col) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke={col}
    strokeWidth="2"
  >
    {d}
  </svg>
);
const BufferKpiIcon = () =>
  kpic(
    <>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-4 0v2" />
    </>,
    "#2563eb",
  );
const WarnKpiIcon = () =>
  kpic(
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />,
    "#d97706",
  );
const AlertKpiIcon = () =>
  kpic(
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </>,
    "#dc2626",
  );
const TrashKpiIcon = () =>
  kpic(
    <>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </>,
    "#dc2626",
  );
const ClockKpiIcon = () =>
  kpic(
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </>,
    "#7c3aed",
  );
const TputKpiIcon = () =>
  kpic(<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />, "#16a34a");

const ClockIcon2 = () =>
  ic(
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </>,
  );
const WarnIcon2 = () =>
  ic(
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />,
  );
const ActivityIcon2 = () =>
  ic(<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />);
const TrashIcon2 = () =>
  ic(
    <>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </>,
  );
const SettingsIcon = () =>
  ic(
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
    </>,
  );
