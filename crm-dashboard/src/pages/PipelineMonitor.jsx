import { useState, useEffect, useRef, useCallback } from "react";
import PageHeader from "../components/ui/PageHeader";
import { PauseIcon, RefreshIcon } from "../components/ui/Icons";
import { ActionButton } from "../components/ui/ActionButton";
import { StatCard } from "../components/ui/StatCard3";
import { Badge } from "../components/ui/Badge";
import { Table } from "../components/TableComponents/Table";
import SingleSelect from "../components/ui/SingleSelect";
import { Section } from "../components/ui/Section";

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const EVENTS = [
  {
    time: "14:28:04",
    stage: "Enricher",
    event: "Backpressure detected",
    sev: "warning",
    detail: "Buffer 3 reached 79% — consumer lag +38ms",
  },
  {
    time: "14:22:41",
    stage: "Enricher",
    event: "Geo lookup latency spike",
    sev: "warning",
    detail: "External geo API p99 jumped to 120ms",
  },
  {
    time: "14:17:09",
    stage: "Parser",
    event: "Parse error burst",
    sev: "info",
    detail: "12 malformed JSON entries skipped",
  },
  {
    time: "14:11:55",
    stage: "Router",
    event: "Cold rule updated",
    sev: "info",
    detail: "Legacy category → cold after 12h (was 24h)",
  },
  {
    time: "13:58:22",
    stage: "Writer",
    event: "Hot store flush",
    sev: "info",
    detail: "Compaction cycle complete — 4.2 GB freed",
  },
  {
    time: "13:42:10",
    stage: "Ingest",
    event: "Traffic spike",
    sev: "info",
    detail: "Throughput peaked at 31,200/s for 40s",
  },
  {
    time: "13:30:00",
    stage: "Pipeline",
    event: "Auto-scale triggered",
    sev: "info",
    detail: "Enricher workers scaled 4→8",
  },
  {
    time: "12:55:18",
    stage: "Writer",
    event: "Cold store batch commit",
    sev: "info",
    detail: "2,100,000 logs archived to cold store",
  },
];

const STAGE_DETAILS = [
  {
    id: "ingest",
    title: "Ingest",
    status: "ok",
    iconColor: "#16a34a",
    iconBg: "bg-green-50",
    badge: {
      label: "Healthy",
      variant: "active",
    },
    cardBorder: "border-gray-200",
    hdBg: "bg-gray-50/60",
    rows: [
      { k: "Throughput", v: "24,800 /s", vc: "#16a34a" },
      { k: "Latency", v: "2ms" },
      { k: "Workers", v: "4 / 4" },
      { k: "Error rate", v: "0.00%", vc: "#16a34a" },
      { k: "CPU", v: "12%" },
    ],
    sparkBase: 24800,
    sparkColor: "#16a34a",
    sparkVol: 0.15,
  },
  {
    id: "parser",
    title: "Parser",
    status: "ok",
    iconColor: "#16a34a",
    iconBg: "bg-green-50",
    badge: {
      label: "Healthy",
      variant: "active",
    },
    cardBorder: "border-gray-200",
    hdBg: "bg-gray-50/60",
    rows: [
      { k: "Throughput", v: "24,600 /s", vc: "#16a34a" },
      { k: "Latency", v: "3ms" },
      { k: "Workers", v: "4 / 4" },
      { k: "Parse errors", v: "0.02%", vc: "#d97706" },
      { k: "CPU", v: "24%" },
    ],
    sparkBase: 24600,
    sparkColor: "#16a34a",
    sparkVol: 0.15,
  },
  {
    id: "enricher",
    title: "Enricher",
    status: "warn",
    iconColor: "#d97706",
    iconBg: "bg-amber-50",
    badge: {
      label: "Slow — backpressure",
      variant: "warning",
    },
    cardBorder: "border-amber-200",
    hdBg: "bg-amber-50",
    rows: [
      { k: "Throughput", v: "22,100 /s", vc: "#d97706" },
      { k: "Latency", v: "42ms ↑", vc: "#d97706" },
      { k: "Workers", v: "8 / 8" },
      { k: "Geo lookup", v: "38ms avg", vc: "#d97706" },
      { k: "CPU", v: "87%", vc: "#d97706" },
    ],
    sparkBase: 22100,
    sparkColor: "#d97706",
    sparkVol: 0.4,
  },
  {
    id: "router",
    title: "Router (Hot / Cold)",
    status: "ok",
    iconColor: "#2563eb",
    iconBg: "bg-blue-50",
    badge: {
      label: "Healthy",
      variant: "active",
    },
    cardBorder: "border-gray-200",
    hdBg: "bg-gray-50/60",
    rows: [
      { k: "Throughput", v: "22,000 /s", vc: "#16a34a" },
      { k: "Hot split", v: "80% → 17,600/s", vc: "#2563eb" },
      { k: "Cold split", v: "20% → 4,400/s", vc: "#0891b2" },
      { k: "Rule evals", v: "8 rules active" },
      { k: "CPU", v: "9%" },
    ],
    sparkBase: 22000,
    sparkColor: "#2563eb",
    sparkVol: 0.18,
  },
  {
    id: "writer-hot",
    title: "Writer — Hot Store",
    status: "ok",
    iconColor: "#2563eb",
    iconBg: "bg-blue-50",
    badge: {
      label: "Healthy",
      variant: "active",
    },
    cardBorder: "border-gray-200",
    hdBg: "bg-gray-50/60",
    rows: [
      { k: "Write rate", v: "17,600 /s", vc: "#2563eb" },
      { k: "Latency", v: "4ms" },
      { k: "Storage used", v: "142 GB / 500 GB" },
      { k: "Retention", v: "48h" },
      { k: "Flush interval", v: "200ms" },
    ],
    sparkBase: 17600,
    sparkColor: "#2563eb",
    sparkVol: 0.18,
  },
  {
    id: "writer-cold",
    title: "Writer — Cold Store",
    status: "ok",
    iconColor: "#0891b2",
    iconBg: "bg-cyan-50",
    badge: {
      label: "Healthy",
      variant: "active",
    },
    cardBorder: "border-gray-200",
    hdBg: "bg-gray-50/60",
    rows: [
      { k: "Write rate", v: "4,400 /s", vc: "#0891b2" },
      { k: "Latency", v: "220ms" },
      { k: "Storage used", v: "2.8 TB / 10 TB" },
      { k: "Retention", v: "90d" },
      { k: "Compression", v: "gzip · 4.2x" },
    ],
    sparkBase: 4400,
    sparkColor: "#0891b2",
    sparkVol: 0.12,
  },
];

// ── SPARKLINE ─────────────────────────────────────────────────────────────────
function Sparkline({ base, color, vol = 0.3 }) {
  const bars = Array.from({ length: 24 }, () =>
    Math.max(0, base + (Math.random() - 0.5) * base * vol),
  );
  const max = Math.max(...bars) || 1;
  return (
    <div className="flex items-end gap-0.5 h-9 mt-1.5 pt-1 border-t border-gray-100">
      {bars.map((v, i) => {
        const h = Math.max(8, (v / max) * 100);
        const c = vol > 0.5 && v < base * 0.7 ? "#d97706" : color;
        return (
          <div
            key={i}
            className="flex-1 rounded-t-sm min-w-[3px] opacity-75 hover:opacity-100 transition-opacity"
            style={{ height: `${h}%`, background: c }}
          />
        );
      })}
    </div>
  );
}

// ── THROUGHPUT CANVAS CHART ───────────────────────────────────────────────────
function ThroughputChart() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.offsetWidth || 500;
    canvas.width = W;
    const H = canvas.height,
      pts = 24;
    const series = [
      { base: 24800, vol: 0.15, col: "#16a34a" },
      { base: 24600, vol: 0.15, col: "#2563eb" },
      { base: 22100, vol: 0.35, col: "#d97706" },
      { base: 22000, vol: 0.18, col: "#0891b2" },
    ];
    const allData = series.map((s, si) =>
      Array.from({ length: pts }, (_, i) => {
        const trend = i > 16 && si === 2 ? s.base * 0.82 : s.base;
        return Math.max(0, trend + (Math.random() - 0.5) * trend * s.vol);
      }),
    );
    const maxV = Math.max(...allData.flat()) * 1.1 || 1;
    ctx.clearRect(0, 0, W, H);
    [0.25, 0.5, 0.75, 1].forEach((r) => {
      ctx.strokeStyle = "#f0f2f7";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, H * r);
      ctx.lineTo(W, H * r);
      ctx.stroke();
      ctx.fillStyle = "#c2c8d4";
      ctx.font = "10px DM Mono,monospace";
      ctx.textAlign = "left";
      ctx.fillText(Math.round((maxV * (1 - r)) / 1000) + "k", 4, H * r - 3);
    });
    allData.forEach((data, si) => {
      const points = data.map((v, i) => ({
        x: (i / (pts - 1)) * W,
        y: H - (v / maxV) * (H - 16) - 8,
      }));
      ctx.beginPath();
      ctx.moveTo(points[0].x, H);
      points.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.lineTo(points[pts - 1].x, H);
      ctx.closePath();
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, series[si].col + "30");
      g.addColorStop(1, series[si].col + "05");
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
    const labels = ["6h ago", "5h", "4h", "3h", "2h", "1h", "Now"];
    labels.forEach((l, i) => {
      const x = (i / (labels.length - 1)) * W;
      ctx.fillStyle = "#c2c8d4";
      ctx.font = "10px DM Sans,sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(l, x, H - 2);
    });
  }, []);
  return <canvas ref={ref} height={140} className="w-full" />;
}

// ── BUFFER CONNECTOR ──────────────────────────────────────────────────────────
function BufConnector({ fill, label }) {
  const color = fill >= 80 ? "#dc2626" : fill >= 60 ? "#d97706" : "#2563eb";
  const lineColor =
    fill >= 80 ? "bg-red-400" : fill >= 60 ? "bg-amber-400" : "bg-blue-500";
  const arrowColor =
    fill >= 80 ? "#dc2626" : fill >= 60 ? "#d97706" : "#2563eb";
  return (
    <div className="flex flex-col items-center gap-1.5 flex-shrink-0 w-20">
      <div className="flex items-center w-full">
        <div className={`flex-1 h-0.5 ${lineColor}`} />
        <svg width="8" height="8" viewBox="0 0 8 8" fill={arrowColor}>
          <polygon points="0,0 8,4 0,8" />
        </svg>
      </div>
      <div className="bg-white border border-gray-200 rounded-md px-2 py-1 w-full text-center">
        <div className="text-[9.5px] text-gray-400 uppercase tracking-wide mb-1">
          {label}
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${fill}%`, background: color }}
          />
        </div>
        <div className="font-mono text-[10px]" style={{ color }}>
          {fill}%
        </div>
      </div>
    </div>
  );
}

// ── PIPELINE STAGE NODE ───────────────────────────────────────────────────────
function PipeStage({ name, rate, status, icon, onClick }) {
  const nodeCls =
    status === "warn"
      ? "bg-amber-50 border-amber-300"
      : status === "crit"
        ? "bg-red-50 border-red-300"
        : "bg-green-50 border-green-300";
  const dotColor =
    status === "warn"
      ? "bg-amber-400"
      : status === "crit"
        ? "bg-red-500 animate-pulse"
        : "bg-green-500";

  const badgeVariant =
    status === "warn" ? "warning" : status === "crit" ? "down" : "active";
  const badgeValue =
    status === "warn" ? "Slow" : status === "crit" ? "Critical" : "Running";

  return (
    <div
      className="flex flex-col items-center gap-2.5 flex-1 min-w-[120px] cursor-pointer group"
      onClick={onClick}
    >
      <div
        className={`relative w-[72px] h-[72px] rounded-2xl flex items-center justify-center border-2 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg ${nodeCls}`}
      >
        <div
          className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${dotColor}`}
        />
        {icon}
      </div>
      <div className="text-[12px] font-medium text-gray-800 text-center">
        {name}
      </div>
      <div className="font-mono text-[11px] text-gray-400 text-center">
        {rate}
      </div>
      <Badge value={badgeValue} variant={badgeVariant} />
    </div>
  );
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

// ── SECTION LABEL ─────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-gray-400 mb-3">
      {children}
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

// ── STAGE ICON HELPERS ────────────────────────────────────────────────────────
const IngestIcon = ({ color }) => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const ParserIcon = ({ color }) => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);
const EnricherIcon = ({ color }) => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const RouterIcon = ({ color }) => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
  >
    <polyline points="16 3 21 3 21 8" />
    <line x1="4" y1="20" x2="21" y2="3" />
    <polyline points="21 16 21 21 16 21" />
    <line x1="15" y1="15" x2="21" y2="21" />
  </svg>
);
const WriterIcon = ({ color }) => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const SmIngestIcon = ({ color }) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const SmParserIcon = ({ color }) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const SmEnricherIcon = ({ color }) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const SmRouterIcon = ({ color }) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
  >
    <polyline points="16 3 21 3 21 8" />
    <line x1="4" y1="20" x2="21" y2="3" />
  </svg>
);
const SmWriterIcon = ({ color }) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const STAGE_ICONS_SM = {
  ingest: <SmIngestIcon color="#16a34a" />,
  parser: <SmParserIcon color="#16a34a" />,
  enricher: <SmEnricherIcon color="#d97706" />,
  router: <SmRouterIcon color="#2563eb" />,
  "writer-hot": <SmWriterIcon color="#2563eb" />,
  "writer-cold": <SmWriterIcon color="#0891b2" />,
};

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function PipelineMonitor() {
  const [toast, setToast] = useState("");
  const [toastTimer, setToastTimer] = useState(null);
  const [timeRange, setTimeRange] = useState("Last 6 hours");
  const [live, setLive] = useState({
    throughput: "24.8k",
    latency: "14ms",
    bufAvg: "38%",
    rates: {
      ingest: "24,800/s",
      parser: "24,600/s",
      enricher: "22,100/s",
      router: "22,000/s",
      writer: "22,000/s",
    },
    bufs: [28, 62, 79, 18],
  });

  const showToast = useCallback(
    (msg) => {
      setToast(msg);
      if (toastTimer) clearTimeout(toastTimer);
      const t = setTimeout(() => setToast(""), 2600);
      setToastTimer(t);
    },
    [toastTimer],
  );

  // Live tick
  useEffect(() => {
    const id = setInterval(() => {
      const noise = () => (Math.random() - 0.5) * 800;
      const ingest = Math.round(24800 + noise());
      const parser = Math.round(ingest - Math.round(Math.random() * 200));
      const enricher = Math.round(parser * (0.88 + Math.random() * 0.05));
      const writer = Math.round(enricher - Math.round(Math.random() * 100));
      const b = [
        Math.round(22 + Math.random() * 18),
        Math.round(55 + Math.random() * 20),
        Math.round(70 + Math.random() * 18),
        Math.round(10 + Math.random() * 16),
      ];
      setLive({
        throughput: (ingest / 1000).toFixed(1) + "k",
        latency: Math.round(12 + Math.random() * 8) + "ms",
        bufAvg: Math.round(b.reduce((s, v) => s + v, 0) / 4) + "%",
        rates: {
          ingest: ingest.toLocaleString() + "/s",
          parser: parser.toLocaleString() + "/s",
          enricher: enricher.toLocaleString() + "/s",
          router: writer.toLocaleString() + "/s",
          writer: writer.toLocaleString() + "/s",
        },
        bufs: b,
      });
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const pipelineStages = [
    {
      name: "Ingest",
      rate: live.rates.ingest,
      status: "ok",
      icon: <IngestIcon color="#16a34a" />,
      toast: `Ingest — ${live.rates.ingest}`,
    },
    {
      name: "Parser",
      rate: live.rates.parser,
      status: "ok",
      icon: <ParserIcon color="#16a34a" />,
      toast: `Parser — ${live.rates.parser}`,
    },
    {
      name: "Enricher",
      rate: live.rates.enricher,
      status: "warn",
      icon: <EnricherIcon color="#d97706" />,
      toast: `Enricher — ${live.rates.enricher} (slower — geo lookup)`,
    },
    {
      name: "Router",
      rate: live.rates.router,
      status: "ok",
      icon: <RouterIcon color="#16a34a" />,
      toast: "Router — Hot/Cold split active",
    },
    {
      name: "Writer",
      rate: live.rates.writer,
      status: "ok",
      icon: <WriterIcon color="#16a34a" />,
      toast: "Writer — Hot: 17.6k/s  Cold: 4.4k/s",
    },
  ];

  const bufLabels = ["Buf 1", "Buf 2", "Buf 3", "Buf 4"];

  const bpRows = [
    {
      name: "Ingest → Parser",
      fill: live.bufs[0],
      lag: live.bufs[0] > 60 ? "+14ms" : "0ms",
    },
    {
      name: "Parser → Enricher",
      fill: live.bufs[1],
      lag: live.bufs[1] > 60 ? "+14ms" : "0ms",
    },
    { name: "Enricher → Router", fill: live.bufs[2], lag: "+38ms" },
    { name: "Router → Writer", fill: live.bufs[3], lag: "0ms" },
  ];

  return (
    <div
      className="flex h-screen overflow-hidden bg-[#f4f6fa] text-gray-800 container-page"
      style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}
    >
      <div className=" flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="pb-4 flex-shrink-0">
          <div className="flex items-center justify-between gap-4 ">
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
                  <rect x="2" y="8" width="4" height="8" rx="1" />
                  <rect x="10" y="5" width="4" height="14" rx="1" />
                  <rect x="18" y="10" width="4" height="6" rx="1" />
                  <line x1="6" y1="12" x2="10" y2="12" />
                  <line x1="14" y1="12" x2="18" y2="12" />
                </svg>
              }
              title="Pipeline Monitor"
              breadcrumbs={[
                { label: "Dashboard", href: "#" },
                { label: "Logs", href: "#" },
                { label: "Pipeline Monitor" },
              ]}
            />

            <div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-[12px] text-gray-400 bg-white border border-gray-200 rounded-lg px-4 py-1.5 min-w-[150px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                  Auto-refresh:{" "}
                  <span className="font-mono text-gray-700 ml-0.5">5s</span>
                </div>
                <SingleSelect
                  value={timeRange}
                  onChange={(val) => {
                    setTimeRange(val);
                    showToast("Range: " + val);
                  }}
                  placeholder="Time Range"
                  options={[
                    { value: "Last 1 hour", label: "Last 1 hour" },
                    {
                      value: "Last 6 hours",
                      label: "Last 6 hours",
                    },
                    {
                      value: "Last 24 hours",
                      label: "Last 24 hours",
                    },
                    {
                      value: "Last 7 days",
                      label: "Last 7 days",
                    },
                  ]}
                  className="border-gray-200 bg-white"
                />

                <ActionButton
                  action="save"
                  onClick={() => showToast("Pipeline paused")}
                  label={"Thresholds"}
                  icon={PauseIcon}
                />

                <ActionButton
                  action="search"
                  onClick={() => showToast("Pipeline restarted")}
                  label={"Restart"}
                  icon={RefreshIcon}
                />
              </div>

              <div className="flex items-center justify-end gap-1.5 pt-1.5 text-[11.5px]">
                <span className="ml-auto flex items-center gap-1.5 text-[11.5px] text-gray-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse inline-block" />
                  All stages running · last tick 1.2s ago
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div
          className="flex-1 overflow-y-auto py-5 pb-12 min-h-0"
          style={{ scrollbarWidth: "thin" }}
        >
          <Section>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-6">
              <StatCard
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="2"
                  >
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                }
                iconColor="text-green-600"
                count={live.throughput}
                countColor="text-green-600"
                title="Logs / sec"
              />
              <StatCard
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                }
                iconColor="text-blue-600"
                count={live.latency}
                countColor="text-blue-600"
                title="Avg Stage Latency"
              />
              <StatCard
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#d97706"
                    strokeWidth="2"
                  >
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 7V5a2 2 0 0 0-4 0v2" />
                  </svg>
                }
                iconColor="text-amber-600"
                count={live.bufAvg}
                countColor="text-amber-600"
                title="Avg Buffer Fill"
              />
              <StatCard
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="2"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  </svg>
                }
                iconColor="text-red-600"
                count="12"
                countColor="text-red-600"
                title="Dropped (1h)"
              />
              <StatCard
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#7c3aed"
                    strokeWidth="2"
                  >
                    <polyline points="17 11 12 6 7 11" />
                    <line x1="12" y1="18" x2="12" y2="6" />
                  </svg>
                }
                iconColor="text-purple-700"
                count="5/5"
                countColor="text-purple-700"
                title="Stages Healthy"
              />
              <StatCard
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0891b2"
                    strokeWidth="2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                }
                iconColor="text-cyan-600"
                count="99.94%"
                countColor="text-cyan-600"
                title="Pipeline Uptime"
              />
            </div>
          </Section>

          <Section>
            {/* Pipeline Flow */}
            <SectionLabel>Pipeline Flow</SectionLabel>
            <div className="bg-white border border-gray-200 rounded-xl p-7 mb-6 overflow-x-auto">
              <div className="flex items-center min-w-[900px]">
                {pipelineStages.map((stage, i) => (
                  <div key={stage.name} className="flex items-center flex-1">
                    <PipeStage
                      {...stage}
                      onClick={() => showToast(stage.toast)}
                    />
                    {i < pipelineStages.length - 1 && (
                      <BufConnector
                        id={`buf-${i + 1}`}
                        fill={live.bufs[i]}
                        label={bufLabels[i]}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Hot/Cold legend */}
              <div className="flex justify-end gap-5 mt-4 pt-3.5 border-t border-gray-200">
                {[
                  {
                    color: "#2563eb",
                    label: "Hot Store",
                    stat: "17,600/s · 80%",
                  },
                  {
                    color: "#0891b2",
                    label: "Cold Store",
                    stat: "4,400/s · 20%",
                  },
                  {
                    color: "#dc2626",
                    label: "Dropped",
                    stat: "12 (0.00%)",
                    statCls: "text-red-600",
                  },
                ].map(({ color, label, stat, statCls }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 text-[12px] text-gray-400"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ background: color }}
                    />
                    {label}
                    <span className={`font-mono ${statCls || "text-gray-800"}`}>
                      {stat}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section>
            {/* Stage Detail Cards */}
            <SectionLabel>Stage Details</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-6">
              {STAGE_DETAILS.map((s) => (
                <div
                  key={s.id}
                  className={`bg-white border rounded-xl overflow-hidden hover:shadow-md transition-shadow ${s.cardBorder}`}
                >
                  <div
                    className={`px-4 py-3 border-b border-gray-200 flex items-center gap-2.5 ${s.hdBg}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${s.iconBg}`}
                    >
                      {STAGE_ICONS_SM[s.id]}
                    </div>
                    <div className="text-[13px] font-medium text-gray-800 flex-1">
                      {s.title}
                    </div>
                    <Badge value={s.badge.label} variant={s.badge.variant} />
                  </div>
                  <div className="px-4 py-3.5 flex flex-col gap-2">
                    {s.rows.map(({ k, v, vc }) => (
                      <div
                        key={k}
                        className="flex items-center justify-between text-[12.5px]"
                      >
                        <span className="text-gray-400">{k}</span>
                        <span
                          className="font-mono text-[12px]"
                          style={{ color: vc || "#1c1f2e" }}
                        >
                          {v}
                        </span>
                      </div>
                    ))}
                    <Sparkline
                      base={s.sparkBase}
                      color={s.sparkColor}
                      vol={s.sparkVol}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section>
            {/* Backpressure + Throughput Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {/* Backpressure */}
              <div>
                <SectionLabel>Buffer Backpressure</SectionLabel>
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  {bpRows.map(({ name, fill, lag }) => {
                    const c =
                      fill >= 80
                        ? "#dc2626"
                        : fill >= 60
                          ? "#d97706"
                          : "#16a34a";
                    const lagC =
                      lag.startsWith("+") && parseInt(lag) > 20
                        ? "text-red-600"
                        : lag === "0ms"
                          ? "text-gray-400"
                          : "text-amber-600";
                    return (
                      <div
                        key={name}
                        className="flex items-center gap-3.5 py-2 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="text-[12.5px] text-gray-700 w-32 flex-shrink-0">
                          {name}
                        </div>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${fill}%`, background: c }}
                          />
                        </div>
                        <div
                          className="font-mono text-[11.5px] w-9 text-right"
                          style={{ color: c }}
                        >
                          {fill}%
                        </div>
                        <div
                          className={`font-mono text-[11px] w-12 text-right ${lagC}`}
                        >
                          {lag}
                        </div>
                      </div>
                    );
                  })}
                  <div className="mt-3.5 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#d97706"
                      strokeWidth="2"
                      className="mt-0.5 flex-shrink-0"
                    >
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    </svg>
                    <span className="text-[12px] text-amber-700">
                      Enricher stage is the bottleneck — Buffer 3 at 79%.
                      Consider scaling workers or optimising geo lookup.
                    </span>
                  </div>
                </div>
              </div>

              {/* Throughput Chart */}
              <div>
                <SectionLabel>Throughput — Last 6h</SectionLabel>
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50/60">
                    <div className="text-[13px] text-gray-700 flex items-center gap-1.5">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                      Logs / second per stage
                    </div>
                    <div className="text-[11.5px] text-gray-400">
                      Peak:{" "}
                      <span className="font-mono text-gray-700">31,200/s</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex gap-4 mb-3">
                      {[
                        ["#16a34a", "Ingest"],
                        ["#2563eb", "Parser"],
                        ["#d97706", "Enricher"],
                        ["#0891b2", "Writer"],
                      ].map(([c, l]) => (
                        <div
                          key={l}
                          className="flex items-center gap-1.5 text-[11.5px] text-gray-400"
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: c }}
                          />
                          {l}
                        </div>
                      ))}
                    </div>
                    <ThroughputChart />
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <Section>
            {/* Event Log */}
            <SectionLabel>Pipeline Event Log</SectionLabel>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <Table
                group={{
                  Timestamp: {
                    hex: "#d97706",
                    bg: "bg-amber-50",
                    text: "text-amber-600",
                  },
                  Pipeline: {
                    hex: "#2563eb",
                    bg: "bg-blue-50",
                    text: "text-blue-600",
                  },
                  Alert: {
                    hex: "#0891b2",
                    bg: "bg-cyan-50",
                    text: "text-cyan-600",
                  },
                  Details: {
                    hex: "#7c3aed",
                    bg: "bg-purple-50",
                    text: "text-purple-700",
                  },
                }}
                columns={[
                  {
                    id: "time",
                    name: "Time",
                    width: 100,
                    group: "Timestamp",
                    cell: (row) => (
                      <span className="font-mono text-[11.5px] text-gray-400">
                        {row.time}
                      </span>
                    ),
                  },
                  {
                    id: "stage",
                    name: "Stage",
                    width: 110,
                    group: "Pipeline",
                    cell: (row) => <Badge value={row.stage} variant="beta" />,
                  },
                  {
                    id: "event",
                    name: "Event",
                    width: 200,
                    group: "Pipeline",
                    cell: (row) => (
                      <span className="text-[12.5px] text-gray-800">
                        {row.event}
                      </span>
                    ),
                  },
                  {
                    id: "sev",
                    name: "Severity",
                    width: 100,
                    group: "Alert",
                    cell: (row) => (
                      <Badge
                        value={row.sev === "warning" ? "Warning" : "Info"}
                        variant={row.sev === "warning" ? "warning" : "default"}
                      />
                    ),
                  },
                  {
                    id: "detail",
                    name: "Detail",
                    width: 260,
                    group: "Details",
                    cell: (row) => (
                      <span className="text-[12px] text-gray-400 truncate">
                        {row.detail}
                      </span>
                    ),
                  },
                ]}
                tableName="pipeline-events"
                data={EVENTS}
                loading={false}
                enableSearch={false}
                pageIndex={0}
                setPageIndex={() => {}}
                pageLimit={EVENTS.length}
                setPageLimit={() => {}}
                paginationData={{
                  totalCount: EVENTS.length,
                  totalPages: 1,
                }}
                onRowClick={() => showToast("Opening full log…")}
                sortField={null}
                setSortField={() => {}}
                sortType={null}
                setSortType={() => {}}
                activeFilters={{}}
                setActiveFilters={() => {}}
                additionalControls={
                  <div className="flex items-center gap-2">
                    <ActionButton
                      action="export"
                      onClick={() => showToast("Opening full log…")}
                      label="View All"
                      icon={null}
                    />
                  </div>
                }
              />
            </div>
          </Section>
        </div>
      </div>

      <Toast message={toast} />
    </div>
  );
}
