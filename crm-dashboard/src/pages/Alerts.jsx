import { useState, useEffect, useRef } from "react";
import PageHeader from "../components/ui/PageHeader";
import { ActionButton } from "../components/ui/ActionButton";
import { Badge } from "../components/ui/Badge";
import { StatCard } from "../components/ui/StatCard3";
import {
  AckIcon,
  AddIcon,
  AlertIcon,
  SilenceIcon,
} from "../components/ui/Icons";
import { Table } from "../components/TableComponents/Table";
import ActionsCell from "../components/TableComponents/ActionsCell";
import SingleSelect from "../components/ui/SingleSelect";
import { Section } from "../components/ui/Section";

const SevBadge = ({ sev }) => {
  if (sev === "critical") return <Badge variant="down" value="Critical" />;
  if (sev === "warning") return <Badge variant="warning" value="Warning" />;
  return <Badge variant="beta" value="Info" />;
};

const ChannelPill = ({ name }) => {
  const icons = {
    Slack: "#",
    Email: "@",
    PagerDuty: "P",
    WhatsApp: "W",
    Webhook: "⚡",
  };
  return <Badge value={`${icons[name] || "·"} ${name}`} />;
};

const Btn = ({
  children,
  onClick,
  variant = "default",
  size = "md",
  className = "",
}) => {
  const sizes = {
    md: "px-3 py-1.5 text-[12.5px] rounded-lg",
    sm: "px-2.5 py-1 text-[12px] rounded-md",
    xs: "px-2 py-0.5 text-[11px] rounded",
  };
  const variants = {
    default:
      "border-gray-200 text-gray-500 bg-white hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50",
    primary: "bg-blue-600 text-white border-blue-600 hover:bg-blue-700",
    red: "bg-red-50 text-red-600 border-red-200 hover:bg-red-600 hover:text-white",
    green:
      "bg-green-50 text-green-700 border-green-200 hover:bg-green-600 hover:text-white",
  };
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 border transition-colors whitespace-nowrap ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// Toggle switch
const Toggle = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="sr-only peer"
    />
    <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-green-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4 after:shadow" />
  </label>
);

// Pulse ring (critical firing indicator)
const PulseRing = () => (
  <span className="relative inline-flex w-2.5 h-2.5 shrink-0 items-center justify-center">
    {/* Outer ping */}
    <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60 animate-ping" />

    {/* Center dot */}
    <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-red-500" />
  </span>
);

const LiveDot = () => (
  <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse inline-block shrink-0" />
);

// ── DATA ─────────────────────────────────────────────────────────────────────
const INIT_ALERTS = [
  {
    id: "alrt-1",
    sev: "critical",
    title: "payment-api Down",
    api: "payment-api",
    rule: "API Downtime Detector",
    desc: "payment-api returning HTTP 503 — upstream gateway timeout. SLA breach in 8 minutes.",
    since: "22m ago",
    channels: ["Slack", "Email", "PagerDuty"],
    acked: false,
    category: "Payments",
    owner: "Sara R.",
  },
  {
    id: "alrt-2",
    sev: "critical",
    title: "email-gateway SSL Expired",
    api: "email-gateway",
    rule: "SSL Certificate Monitor",
    desc: "TLS certificate expired 5 hours ago. All outbound email delivery failing.",
    since: "5h ago",
    channels: ["Slack", "Email"],
    acked: false,
    category: "Platform",
    owner: "James L.",
  },
  {
    id: "alrt-3",
    sev: "warning",
    title: "Buffer 3 High Fill (79%)",
    api: "Pipeline",
    rule: "Buffer Overflow Guard",
    desc: "Enricher → Router buffer at 79% capacity. Backpressure active — consumer lag +38ms.",
    since: "14m ago",
    channels: ["Slack"],
    acked: true,
    category: "Infrastructure",
    owner: "Alex M.",
  },
];

const RULES_DATA = [
  {
    name: "API Downtime Detector",
    cond: "HTTP status = 503 for 1 min",
    sev: "critical",
    target: "All APIs",
    channels: ["Slack", "Email", "PagerDuty"],
    lastFired: "22m ago",
    fires: 47,
    enabled: true,
  },
  {
    name: "SSL Certificate Monitor",
    cond: "SSL expiry < 7 days",
    sev: "critical",
    target: "All APIs",
    channels: ["Slack", "Email"],
    lastFired: "5h ago",
    fires: 3,
    enabled: true,
  },
  {
    name: "High Latency Alert",
    cond: "Response time > 2000ms 5 min",
    sev: "warning",
    target: "All APIs",
    channels: ["Slack"],
    lastFired: "36m ago",
    fires: 28,
    enabled: true,
  },
  {
    name: "Buffer Overflow Guard",
    cond: "Buffer fill > 75%",
    sev: "warning",
    target: "Pipeline",
    channels: ["Slack"],
    lastFired: "14m ago",
    fires: 12,
    enabled: true,
  },
  {
    name: "Payment 5xx Spike",
    cond: "Error rate > 5% for 3 min",
    sev: "critical",
    target: "payment-api",
    channels: ["Slack", "Email", "PagerDuty"],
    lastFired: "1h ago",
    fires: 22,
    enabled: true,
  },
  {
    name: "Auth Slow Response",
    cond: "Response time > 1000ms",
    sev: "warning",
    target: "auth-service",
    channels: ["Email"],
    lastFired: "36m ago",
    fires: 14,
    enabled: true,
  },
  {
    name: "Uptime Drop",
    cond: "Uptime < 99% (30d)",
    sev: "critical",
    target: "All APIs",
    channels: ["Slack", "Email"],
    lastFired: "2h ago",
    fires: 8,
    enabled: true,
  },
  {
    name: "Consumer Lag Alert",
    cond: "Buffer lag > 30ms",
    sev: "warning",
    target: "Pipeline Buf 3",
    channels: ["Slack"],
    lastFired: "14m ago",
    fires: 6,
    enabled: true,
  },
  {
    name: "DLQ Spike",
    cond: "DLQ count > 5",
    sev: "warning",
    target: "Pipeline DLQ",
    channels: ["Slack", "Email"],
    lastFired: "22m ago",
    fires: 4,
    enabled: true,
  },
  {
    name: "Risk Score Critical",
    cond: "Risk score > 80",
    sev: "warning",
    target: "All APIs",
    channels: ["Email"],
    lastFired: "4h ago",
    fires: 19,
    enabled: false,
  },
  {
    name: "Deployment Anomaly",
    cond: "Error spike after deploy",
    sev: "info",
    target: "All APIs",
    channels: ["Slack"],
    lastFired: "2d ago",
    fires: 3,
    enabled: true,
  },
  {
    name: "Cold Store Full",
    cond: "Cold storage > 90%",
    sev: "critical",
    target: "Storage",
    channels: ["Slack", "Email"],
    lastFired: "Never",
    fires: 0,
    enabled: true,
  },
];

const CHANNELS_DATA = [
  {
    name: "Slack",
    icon: "#",
    color: "#4a154b",
    bgColor: "#f5f0f8",
    status: "connected",
    sent: 89,
    fails: 0,
    lastUsed: "2m ago",
    webhook: "hooks.slack.com/T0…",
  },
  {
    name: "Email",
    icon: "@",
    color: "#2563eb",
    bgColor: "#eff4ff",
    status: "connected",
    sent: 42,
    fails: 1,
    lastUsed: "5m ago",
    webhook: "smtp.company.com",
  },
  {
    name: "PagerDuty",
    icon: "P",
    color: "#06AC38",
    bgColor: "#f0fdf4",
    status: "connected",
    sent: 7,
    fails: 0,
    lastUsed: "22m ago",
    webhook: "events.pagerduty.com",
  },
  {
    name: "WhatsApp",
    icon: "W",
    color: "#25d366",
    bgColor: "#f0fdf8",
    status: "connected",
    sent: 4,
    fails: 0,
    lastUsed: "1h ago",
    webhook: "+1 555-0190",
  },
  {
    name: "Webhook",
    icon: "⚡",
    color: "#7c3aed",
    bgColor: "#f5f3ff",
    status: "connected",
    sent: 0,
    fails: 0,
    lastUsed: "Never",
    webhook: "https://hooks.company.io/alerts",
  },
  {
    name: "OpsGenie",
    icon: "O",
    color: "#ea580c",
    bgColor: "#fff7ed",
    status: "disconnected",
    sent: 0,
    fails: 0,
    lastUsed: "Never",
    webhook: "Not configured",
  },
];

const HISTORY_DATA = [
  {
    time: "14:24:12",
    name: "payment-api Down",
    sev: "critical",
    api: "payment-api",
    dur: "Ongoing",
    by: "—",
    notified: ["Slack", "Email", "PD"],
  },
  {
    time: "14:20:44",
    name: "Buffer 3 High Fill",
    sev: "warning",
    api: "Pipeline",
    dur: "Ongoing",
    by: "—",
    notified: ["Slack"],
  },
  {
    time: "13:52:18",
    name: "High Latency Alert",
    sev: "warning",
    api: "auth-service",
    dur: "14m",
    by: "Auto",
    notified: ["Slack"],
  },
  {
    time: "13:41:05",
    name: "Auth Slow Response",
    sev: "warning",
    api: "auth-service",
    dur: "22m",
    by: "Sara R.",
    notified: ["Email"],
  },
  {
    time: "12:58:33",
    name: "Payment 5xx Spike",
    sev: "critical",
    api: "payment-api",
    dur: "8m",
    by: "Auto",
    notified: ["Slack", "Email", "PD"],
  },
  {
    time: "12:30:11",
    name: "High Latency Alert",
    sev: "warning",
    api: "cdn-api",
    dur: "5m",
    by: "Auto",
    notified: ["Slack"],
  },
  {
    time: "11:14:59",
    name: "Uptime Drop",
    sev: "critical",
    api: "legacy-v1-api",
    dur: "1h 22m",
    by: "James L.",
    notified: ["Slack", "Email"],
  },
  {
    time: "10:02:44",
    name: "Consumer Lag Alert",
    sev: "warning",
    api: "Pipeline Buf 2",
    dur: "9m",
    by: "Auto",
    notified: ["Slack"],
  },
  {
    time: "09:48:18",
    name: "Risk Score Critical",
    sev: "warning",
    api: "payment-api",
    dur: "—",
    by: "Suppressed",
    notified: [],
  },
  {
    time: "08:33:01",
    name: "API Downtime Detector",
    sev: "critical",
    api: "email-gateway",
    dur: "4h 12m",
    by: "James L.",
    notified: ["Slack", "Email"],
  },
];

const SILENCES_DATA = [
  {
    target: "payment-api",
    reason: "Emergency maintenance window",
    start: "14:00",
    end: "16:00",
    by: "Alex M.",
    remaining: "1h 36m",
  },
  {
    target: "Rule: Deployment Anomaly",
    reason: "Scheduled deploy — CI/CD pipeline",
    start: "09:00",
    end: "10:00",
    by: "Sara R.",
    remaining: "Expired",
  },
];

const FEED_POOL = [
  {
    col: "#dc2626",
    api: "payment-api",
    msg: "Still returning 503 — upstream timeout",
  },
  {
    col: "#dc2626",
    api: "email-gateway",
    msg: "SSL cert invalid — delivery blocked",
  },
  {
    col: "#d97706",
    api: "Buffer 3",
    msg: "Fill at 79% — lag +38ms, backpressure active",
  },
  {
    col: "#16a34a",
    api: "billing-api",
    msg: "Recovered — latency back to normal",
  },
  {
    col: "#d97706",
    api: "auth-service",
    msg: "High latency 2.4s — JWT validation slow",
  },
  { col: "#16a34a", api: "order-api", msg: "Alert resolved — uptime restored" },
  {
    col: "#dc2626",
    api: "legacy-v1-api",
    msg: "Host unreachable — 504 gateway timeout",
  },
  {
    col: "#d97706",
    api: "cdn-api",
    msg: "Response time 820ms — above threshold",
  },
];

// ── MODAL ─────────────────────────────────────────────────────────────────────
function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxW = "max-w-[560px]",
}) {
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[600] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-[90%] ${maxW} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <span className="text-[15px] font-light text-gray-800">{title}</span>
          <button
            onClick={onClose}
            className="w-6.5 h-6.5 flex items-center justify-center border border-gray-200 rounded-md hover:border-gray-300 text-gray-400 transition-colors"
            style={{ width: 26, height: 26 }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-5 flex flex-col gap-3.5">{children}</div>
        {footer && (
          <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

const FieldLabel = ({ children }) => (
  <div className="text-[12px] text-gray-400 mb-1.5">{children}</div>
);
const Input = ({ ...props }) => (
  <input
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 placeholder:text-gray-300 bg-white transition-all"
    {...props}
  />
);
const Select = ({ children, ...props }) => (
  <select
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 outline-none focus:border-blue-500 bg-white cursor-pointer"
    {...props}
  >
    {children}
  </select>
);

// ── NEW RULE MODAL ────────────────────────────────────────────────────────────
function NewRuleModal({ isOpen, onClose, onSave }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Alert Rule"
      footer={
        <>
          <ActionButton
            action="clear"
            label="Cancel"
            onClick={onClose}
            icon={null}
          />
          <ActionButton
            action="search"
            label="Save Rule"
            onClick={onSave}
            icon={AddIcon}
          />
        </>
      }
    >
      <div>
        <FieldLabel>
          Rule Name <span className="text-red-500">*</span>
        </FieldLabel>
        <Input placeholder="e.g. Payment API 5xx Alert" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <FieldLabel>Severity</FieldLabel>
          <Select>
            <option>Critical</option>
            <option>Warning</option>
            <option>Info</option>
          </Select>
        </div>
        <div>
          <FieldLabel>Target</FieldLabel>
          <Select>
            <option>All APIs</option>
            <option>payment-api</option>
            <option>auth-service</option>
            <option>email-gateway</option>
            <option>Category: Payments</option>
          </Select>
        </div>
      </div>
      <div>
        <FieldLabel>Condition</FieldLabel>
        <div className="flex gap-2 items-center flex-wrap">
          <Select className="flex-1 min-w-[130px]">
            <option>HTTP Status ≥</option>
            <option>Response time {">"}</option>
            <option>Uptime {"<"}</option>
            <option>Error rate {">"}</option>
            <option>Buffer fill {">"}</option>
          </Select>
          <Input defaultValue="500" className="w-20 shrink-0" />
          <Select className="flex-1 min-w-[130px]">
            <option>for 1 min</option>
            <option>for 5 min</option>
            <option>immediately</option>
            <option>3 consecutive</option>
          </Select>
        </div>
      </div>
      <div>
        <FieldLabel>Notify via</FieldLabel>
        <div className="flex gap-4 flex-wrap">
          {["Email", "Slack", "WhatsApp", "PagerDuty", "Webhook"].map(
            (ch, i) => (
              <label
                key={ch}
                className="flex items-center gap-1.5 text-[13px] cursor-pointer"
              >
                <input
                  type="checkbox"
                  defaultChecked={i < 2}
                  className="accent-blue-600"
                />
                {ch}
              </label>
            ),
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <FieldLabel>Cooldown</FieldLabel>
          <Select>
            <option>5 min</option>
            <option defaultValue>15 min</option>
            <option>30 min</option>
            <option>1 hour</option>
          </Select>
        </div>
        <div>
          <FieldLabel>Auto-resolve after</FieldLabel>
          <Select>
            <option>Never</option>
            <option>5 min</option>
            <option defaultValue>15 min</option>
            <option>1 hour</option>
          </Select>
        </div>
      </div>
      <div>
        <FieldLabel>Description</FieldLabel>
        <textarea
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12.5px] outline-none focus:border-blue-500 placeholder:text-gray-300 resize-none"
          rows={2}
          placeholder="What does this alert mean and what action to take?"
        />
      </div>
    </Modal>
  );
}

// ── SILENCE MODAL ─────────────────────────────────────────────────────────────
function SilenceModal({ isOpen, onClose, onSave }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Silence"
      maxW="max-w-[460px]"
      footer={
        <>
          <ActionButton
            action="clear"
            label="Cancel"
            onClick={onClose}
            icon={null}
          />
          <ActionButton
            action="search"
            label="Add Silence"
            onClick={onSave}
            icon={AddIcon}
          />
        </>
      }
    >
      <div>
        <FieldLabel>Silence Target</FieldLabel>
        <Select>
          <option>All Alerts</option>
          <option>payment-api</option>
          <option>auth-service</option>
          <option>Category: Payments</option>
          <option>Rule: Payment 5xx</option>
        </Select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <FieldLabel>Start</FieldLabel>
          <Input type="datetime-local" defaultValue="2024-03-28T14:00" />
        </div>
        <div>
          <FieldLabel>End</FieldLabel>
          <Input type="datetime-local" defaultValue="2024-03-28T16:00" />
        </div>
      </div>
      <div>
        <FieldLabel>Reason</FieldLabel>
        <Input placeholder="e.g. Planned maintenance window" />
      </div>
      <div>
        <FieldLabel>Created by</FieldLabel>
        <Input defaultValue="Alex Morgan" />
      </div>
    </Modal>
  );
}

// ── TAB: ACTIVE ALERTS ────────────────────────────────────────────────────────
function ActiveAlertsTab({ alerts, onAck, showToast }) {
  const iconBg = {
    critical: "bg-red-50",
    warning: "bg-amber-50",
    info: "bg-blue-50",
  };
  const iconStroke = {
    critical: "#dc2626",
    warning: "#d97706",
    info: "#2563eb",
  };

  return (
    <div className="flex flex-col gap-2.5">
      {alerts.map((a) => (
        <div
          key={a.id}
          className={`bg-white border border-gray-200  rounded-xl p-4 flex items-start gap-4 transition-shadow hover:shadow-md cursor-pointer`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg[a.sev]}`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={iconStroke[a.sev]}
              strokeWidth="2"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <SevBadge sev={a.sev} />
              <span className="text-[15px] font-medium text-gray-800">
                {a.title}
              </span>
              {a.acked && <Badge variant="default" value="ACK'd" />}
            </div>
            <div className="text-[12.5px] text-gray-500 leading-relaxed mb-2">
              {a.desc}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="Test" value={a.api} />
              <span className="text-[11px] text-gray-400">Rule: {a.rule}</span>
              <span className="text-gray-300">·</span>
              <span className="text-[11px] text-gray-400">
                Owner: {a.owner}
              </span>
              <span className="text-gray-300">·</span>
              <span className="text-[11px] text-gray-400">
                Category: {a.category}
              </span>
              <span className="text-gray-300">·</span>
              {a.channels.map((c) => (
                <ChannelPill key={c} name={c} />
              ))}
            </div>
          </div>
          <div
            className="flex flex-col gap-1.5 shrink-0 items-end"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="font-mono text-[11px] text-gray-400">
              {a.since}
            </span>
            {a.acked ? (
              <Btn
                size="sm"
                variant="green"
                onClick={() => showToast(`Resolved: ${a.title}`)}
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Resolve
              </Btn>
            ) : (
              <ActionButton
                action="save"
                onClick={() => onAck(a.id)}
                label="Acknowledge"
                icon={AckIcon}
              />
            )}

            <ActionButton
              action="save"
              onClick={() => showToast(`Silence added for ${a.api}`)}
              label="Silence"
              icon={SilenceIcon}
            />
            <ActionButton
              action="delete"
              onClick={() => showToast("Incident opened")}
              label="Open Incident"
              icon={AlertIcon}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const ALERT_GROUPS = {
  "Rule Info": { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  Priority: { hex: "#ea580c", bg: "bg-orange-50", text: "text-orange-700" },
  Notifications: { hex: "#16a34a", bg: "bg-green-50", text: "text-green-700" },
  Activity: { hex: "#7c3aed", bg: "bg-purple-50", text: "text-purple-700" },
  Controls: { hex: "#6b7280", bg: "bg-gray-50", text: "text-gray-500" },
};

function RulesTab({ showToast, openRule }) {
  const [rules, setRules] = useState(RULES_DATA.map((r) => ({ ...r })));
  const [query, setQuery] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageLimit, setPageLimit] = useState(25);
  const [sevFilter, setSevFilter] = useState("all");

  const filtered = rules.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.target.toLowerCase().includes(query.toLowerCase());

    const matchesSev =
      sevFilter === "all" || sevFilter === null || r.sev === sevFilter;

    return matchesSearch && matchesSev;
  });

  const toggleRule = (i) => {
    const updated = [...rules];
    updated[i] = { ...updated[i], enabled: !updated[i].enabled };
    showToast(
      `${updated[i].name} ${updated[i].enabled ? "enabled" : "disabled"}`,
    );
    setRules(updated);
  };

  const columns = [
    {
      id: "name",
      name: "Rule Name",
      width: 200,
      group: "Rule Info",
      pinned: false,
      cell: (row) => (
        <span className="font-medium text-[12.5px] whitespace-nowrap">
          {row.name}
        </span>
      ),
    },
    {
      id: "cond",
      name: "Condition",
      width: 200,
      group: "Rule Info",
      cell: (row) => (
        <span className="font-mono text-[11.5px] text-gray-400">
          {row.cond}
        </span>
      ),
    },
    {
      id: "sev",
      name: "Severity",
      width: 120,
      group: "Priority",
      cell: (row) => <SevBadge sev={row.sev} />,
    },
    {
      id: "target",
      name: "Target",
      width: 140,
      group: "Priority",
      cell: (row) => <Badge variant="beta" value={row.target} />,
    },
    {
      id: "channels",
      name: "Channels",
      width: 230,
      group: "Notifications",
      cell: (row) => (
        <div className="flex gap-1 flex-wrap">
          {row.channels.map((c) => (
            <Badge key={c} variant="default" value={c} />
          ))}
        </div>
      ),
    },
    {
      id: "lastFired",
      name: "Last Fired",
      width: 120,
      group: "Activity",
      cell: (row) => (
        <span className="text-[12px] text-gray-400 whitespace-nowrap">
          {row.lastFired}
        </span>
      ),
    },
    {
      id: "fires",
      name: "Fires",
      width: 80,
      group: "Activity",
      cell: (row) => (
        <span
          className={`font-mono text-[12.5px] ${row.fires > 20 ? "text-red-600" : row.fires > 5 ? "text-amber-600" : "text-gray-700"}`}
        >
          {row.fires}
        </span>
      ),
    },
    {
      id: "enabled",
      name: "Enabled",
      width: 90,
      group: "Controls",
      cell: (row) => (
        <Toggle
          checked={row.enabled}
          onChange={() => toggleRule(rules.indexOf(row))}
        />
      ),
    },
    {
      id: "actions",
      name: "Actions",
      group: "Actions",
      description: "Row actions",
      visible: true,
      pinnedRight: true,
      width: 60,
      disableSortBy: true,
      cell: (row) => (
        <ActionsCell
          row={row}
          actions={[
            {
              name: "View",
              icon: (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ),
              onClick: (row) => console.log("View", row),
            },
            {
              name: "Edit",
              icon: (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              ),
              onClick: (row) => console.log("Edit", row),
            },
            {
              name: "Delete",
              danger: true,
              icon: (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              ),
              onClick: (row) => console.log("Delete", row),
            },
          ]}
        />
      ),
    },
  ];

  const paginated = filtered.slice(
    pageIndex * pageLimit,
    (pageIndex + 1) * pageLimit,
  );

  return (
    <div className="overflow-hidden">
      <Table
        columns={columns}
        group={ALERT_GROUPS}
        tableName="alert-table"
        data={paginated}
        loading={false}
        enableSearch={true}
        searchInput={query}
        setSearchInput={(val) => {
          setQuery(val);
          setPageIndex(0);
        }}
        pageIndex={pageIndex}
        setPageIndex={setPageIndex}
        pageLimit={pageLimit}
        setPageLimit={setPageLimit}
        paginationData={{
          totalCount: filtered.length,
          totalPages: Math.ceil(filtered.length / pageLimit),
        }}
        onRowClick={openRule}
        sortField={null}
        setSortField={() => {}}
        sortType={null}
        setSortType={() => {}}
        activeFilters={[]}
        setActiveFilters={() => {}}
        additionalControls={
          <div className="flex gap-2">
            <SingleSelect
              value={sevFilter}
              onChange={(val) => {
                setSevFilter(val);
                showToast("Filtered: " + val);
              }}
              placeholder="All Severities"
              options={[
                { value: "all", label: "All Severities" },
                { value: "critical", label: "Critical", dot: "#dc2626" },
                { value: "warning", label: "Warning", dot: "#d97706" },
                { value: "info", label: "Info", dot: "#2563eb" },
              ]}
              className="border-gray-200"
            />
            {/* <ActionButton
              action="search"
              onClick={openRule}
              label="New Rule"
              icon={AddIcon}
            /> */}
          </div>
        }
      />
    </div>
  );
}

// ── TAB: CHANNELS ─────────────────────────────────────────────────────────────
function ChannelsTab({ showToast }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {CHANNELS_DATA.map((c) => (
        <div
          key={c.name}
          className={`bg-white border rounded-xl p-5 transition-shadow hover:shadow-md ${c.status === "connected" ? "border-green-200" : "border-gray-200 opacity-70"}`}
        >
          <div className="flex items-center gap-3 mb-3.5">
            <div
              className="w-[42px] h-[42px] rounded-xl flex items-center justify-center shrink-0 text-[18px] font-bold"
              style={{ background: c.bgColor, color: c.color }}
            >
              {c.icon}
            </div>
            <div>
              <div className="text-[14px] font-medium text-gray-800">
                {c.name}
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    c.status === "connected" ? "bg-green-600 " : "bg-gray-300"
                  }`}
                />
                <span
                  className={`text-[12px] ${
                    c.status === "connected"
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  {c.status === "connected" ? "Connected" : "Disconnected"}
                </span>
              </div>
            </div>
            <div className="ml-auto">
              {c.status === "connected" ? (
                <ActionButton
                  action="export"
                  label="Test"
                  icon={null}
                  onClick={() => showToast(`${c.name} test sent`)}
                />
              ) : (
                <ActionButton
                  action="search"
                  label="Connect"
                  icon={null}
                  onClick={() => showToast(`Connecting ${c.name}…`)}
                />
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-[18px] font-light text-green-600">
                {c.sent}
              </div>
              <div className="text-[10.5px] text-gray-400">Sent (24h)</div>
            </div>
            <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
              <div
                className={`text-[18px] font-light ${c.fails > 0 ? "text-red-600" : "text-gray-400"}`}
              >
                {c.fails}
              </div>
              <div className="text-[10.5px] text-gray-400">Failures</div>
            </div>
          </div>
          <div
            className="text-[11.5px] text-gray-400 mb-3 truncate"
            title={c.webhook}
          >
            {c.webhook}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400">
              Last used: {c.lastUsed}
            </span>
            <div className="flex gap-1.5">
              <ActionButton
                action="export"
                label="Settings"
                icon={null}
                onClick={() => showToast(`${c.name} settings`)}
              />
              {c.status === "connected" && (
                <ActionButton
                  action="delete"
                  label="Disconnect"
                  icon={null}
                  onClick={() => showToast(`${c.name} disconnected`)}
                />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const HISTORY_GROUPS = {
  Timeline: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  "Alert Info": { hex: "#ea580c", bg: "bg-orange-50", text: "text-orange-700" },
  Resolution: { hex: "#16a34a", bg: "bg-green-50", text: "text-green-700" },
  Notifications: { hex: "#0891b2", bg: "bg-cyan-50", text: "text-cyan-600" },
};

// ── TAB: HISTORY ──────────────────────────────────────────────────────────────
function HistoryTab({ showToast }) {
  const [pageIndex, setPageIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [pageLimit, setPageLimit] = useState(25);
  const [sortField, setSortField] = useState(null);
  const [sortType, setSortType] = useState(null);
  const [timeRange, setTimeRange] = useState("Last 24h");

  const HISTORY_GROUPS = {
    Timeline: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
    "Alert Info": {
      hex: "#ea580c",
      bg: "bg-orange-50",
      text: "text-orange-700",
    },
    Resolution: { hex: "#16a34a", bg: "bg-green-50", text: "text-green-700" },
    Notifications: { hex: "#0891b2", bg: "bg-cyan-50", text: "text-cyan-600" },
  };

  const columns = [
    // ── Timeline ──
    {
      id: "time",
      name: "Time",
      width: 100,
      group: "Timeline",
      cell: (row) => (
        <span className="font-mono text-[11.5px] text-gray-400">
          {row.time}
        </span>
      ),
    },

    // ── Alert Info ──
    {
      id: "name",
      name: "Alert",
      width: 200,
      group: "Alert Info",
      cell: (row) => (
        <span className="font-medium text-[12.5px] whitespace-nowrap">
          {row.name}
        </span>
      ),
    },
    {
      id: "sev",
      name: "Severity",
      width: 120,
      group: "Alert Info",
      cell: (row) => <SevBadge sev={row.sev} />,
    },
    {
      id: "api",
      name: "API / Target",
      width: 140,
      group: "Alert Info",
      cell: (row) => <Badge variant="Test" value={row.api} />,
    },
    {
      id: "dur",
      name: "Duration",
      width: 110,
      group: "Alert Info",
      cell: (row) => (
        <span
          className={`font-mono text-[12px] ${row.dur === "Ongoing" ? "text-red-600" : "text-gray-700"}`}
        >
          {row.dur}
        </span>
      ),
    },

    // ── Resolution ──
    {
      id: "by",
      name: "Resolved By",
      width: 120,
      group: "Resolution",
      cell: (row) => (
        <span className="text-[12px] text-gray-400">{row.by}</span>
      ),
    },

    // ── Notifications ──
    {
      id: "notified",
      name: "Notified",
      width: 180,
      group: "Notifications",
      cell: (row) => (
        <div className="flex gap-1 flex-wrap">
          {row.notified.length > 0 ? (
            row.notified.map((n) => (
              <Badge key={n} variant="default" value={n} />
            ))
          ) : (
            <span className="text-[11px] text-gray-400">Suppressed</span>
          )}
        </div>
      ),
    },
  ];

  const paginated = HISTORY_DATA.slice(
    pageIndex * pageLimit,
    (pageIndex + 1) * pageLimit,
  );

  return (
    <div className="overflow-hidden">
      <Table
        columns={columns}
        group={HISTORY_GROUPS}
        tableName="alert-history"
        data={paginated}
        loading={false}
        enableSearch={true}
        searchInput={query}
        setSearchInput={(val) => {
          setQuery(val);
          setPageIndex(0);
        }}
        pageIndex={pageIndex}
        setPageIndex={setPageIndex}
        pageLimit={pageLimit}
        setPageLimit={setPageLimit}
        paginationData={{
          totalCount: HISTORY_DATA.length,
          totalPages: Math.ceil(HISTORY_DATA.length / pageLimit),
        }}
        onRowClick={(row) => showToast(`Opening alert: ${row.name}`)}
        sortField={sortField}
        setSortField={setSortField}
        sortType={sortType}
        setSortType={setSortType}
        activeFilters={{}}
        setActiveFilters={() => {}}
        additionalControls={
          <div className="flex items-center gap-2">
            {/* Range select */}

            <SingleSelect
              value={timeRange}
              onChange={(val) => {
                setTimeRange(val);
                showToast("Range: " + val);
              }}
              placeholder="Time Range"
              options={[
                { value: "Last 24h", label: "Last 24h" },
                { value: "Last 7d", label: "Last 7d" },
                { value: "Last 30d", label: "Last 30d" },
              ]}
              className="border-gray-200"
            />
            {/* Export */}
            <ActionButton
              action="export"
              onClick={() => showToast("Exported history")}
              label="Export CSV"
              icon={null}
            />
          </div>
        }
      />
    </div>
  );
}

// ── TAB: SILENCES ─────────────────────────────────────────────────────────────
function SilencesTab({ showToast, openSilence }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-[#fafbfc]">
        <div className="flex items-center gap-1.5 text-[13px] font-medium text-gray-800">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M17 17H3s3-2 3-9a4.67 4.67 0 0 1 .08-.82" />
          </svg>
          Active Silences
        </div>
        <ActionButton
          action="search"
          label="Add Silence"
          icon={null}
          onClick={openSilence}
        />
      </div>
      {SILENCES_DATA.map((s, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3.5 border-b border-gray-100 last:border-0"
        >
          <div
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.remaining === "Expired" ? "bg-gray-400" : "bg-amber-500"}`}
          />
          <div className="flex-1">
            <div className="text-[13px] font-medium text-gray-800 mb-0.5">
              {s.target}
            </div>
            <div className="text-[11px] text-gray-400">{s.reason}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              {s.start} – {s.end} · by {s.by}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div
              className={`font-mono text-[12px] mb-1.5 ${s.remaining === "Expired" ? "text-gray-400" : "text-amber-600"}`}
            >
              {s.remaining}
            </div>
            {s.remaining !== "Expired" ? (
              <ActionButton
                action="delete"
                label="End Now"
                icon={null}
                onClick={() => showToast("Silence ended")}
              />
            ) : (
              <Badge variant="default" value="Expired" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── LIVE FEED ─────────────────────────────────────────────────────────────────
function LiveFeed({ showToast }) {
  const now = () => {
    const d = new Date();
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  };
  const seed = FEED_POOL.slice(0, 6).map((ev, i) => ({
    ...ev,
    time: `${14 - i}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")} ago`,
  }));
  const [feed, setFeed] = useState(seed);

  const inject = () => {
    const ev = FEED_POOL[Math.floor(Math.random() * FEED_POOL.length)];
    const entry = { ...ev, time: now() };
    setFeed((prev) => [entry, ...prev].slice(0, 20));
    showToast(`Alert: ${ev.api} — ${ev.msg.slice(0, 40)}`);
  };

  useEffect(() => {
    const t = setInterval(() => {
      if (Math.random() > 0.6) inject();
    }, 12000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-[270px] shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-[#fafbfc] shrink-0">
        <div className="flex items-center gap-2 text-[13px] font-medium text-gray-800">
          <LiveDot />
          Live Alert Feed
        </div>
        <Btn size="sm" onClick={inject}>
          Simulate
        </Btn>
      </div>
      <div className="flex-1 overflow-y-auto">
        {feed.map((f, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 px-3.5 py-2.5 border-b border-gray-100 last:border-0 hover:bg-blue-50/30 cursor-pointer transition-colors"
          >
            <div
              className="w-2 h-2 rounded-full shrink-0 mt-1"
              style={{ background: f.col }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-medium text-gray-800">
                {f.api}
              </div>
              <div className="text-[11.5px] text-gray-400 leading-snug">
                {f.msg}
              </div>
              <div className="text-[10.5px] text-gray-300 mt-0.5">{f.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState(null);
  const t = useRef();
  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(t.current);
    t.current = setTimeout(() => setToast(null), 2600);
  };
  return { toast, showToast };
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function Alerts() {
  const { toast, showToast } = useToast();
  const [activeTab, setActiveTab] = useState("active");
  const [alerts, setAlerts] = useState(INIT_ALERTS.map((a) => ({ ...a })));
  const [ruleModal, setRuleModal] = useState(false);
  const [silenceModal, setSilenceModal] = useState(false);
  const [notifCount, setNotifCount] = useState(142);

  useEffect(() => {
    const t = setInterval(
      () => setNotifCount((n) => n + Math.floor(Math.random() * 3)),
      8000,
    );
    return () => clearInterval(t);
  }, []);

  const ackAlert = (id) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acked: true } : a)),
    );
    const a = alerts.find((x) => x.id === id);
    if (a) showToast("Acknowledged: " + a.title);
  };
  const ackAll = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, acked: true })));
    showToast("All alerts acknowledged");
  };

  const TABS = [
    {
      id: "active",
      label: "Active Alerts",
      count: alerts.length,
      prefix: <PulseRing />,
    },
    {
      id: "rules",
      label: "Alert Rules",
      count: 24,
      prefix: (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        </svg>
      ),
    },
    {
      id: "channels",
      label: "Channels",
      count: 4,
      prefix: (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.77 12" />
        </svg>
      ),
    },
    {
      id: "history",
      label: "History",
      count: 247,
      prefix: (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      id: "silences",
      label: "Silences",
      count: 2,
      prefix: (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M17 17H3s3-2 3-9a4.67 4.67 0 0 1 .08-.82" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f6fa] text-[#1c1f2e] text-sm antialiased container-page">
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <div className=" border-b border-gray-200 pb-3.5 shrink-0">
          <div className="flex items-center justify-between gap-4 ">
            <PageHeader
              className="flex flex-col gap-1.5"
              icon={
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="2"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              }
              iconGradient="bg-transparent"
              title="Alerts"
              breadcrumbs={[
                { label: "Dashboard", href: "#" },
                { label: "Alerts" },
              ]}
            />

            <div>
              <div className="flex items-center gap-2">
                <ActionButton
                  action="save"
                  onClick={ackAll}
                  label={"Ack All"}
                  icon={AckIcon}
                />
                <ActionButton
                  action="export"
                  onClick={() => showToast("Alert report exported")}
                  label="Export"
                />
                <ActionButton
                  action="save"
                  onClick={() => setSilenceModal(true)}
                  label="Silence"
                  icon={SilenceIcon}
                />
                <ActionButton
                  action="search"
                  onClick={() => setRuleModal(true)}
                  label="New Rule"
                  icon={AddIcon}
                />
              </div>
              <div className="flex items-center gap-3 justify-end text-[11.5px] text-gray-500 pt-1.5">
                <div className="flex items-center gap-1.5">
                  <PulseRing />
                  <span className="text-red-600 font-medium">3 firing now</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <LiveDot />
                  <span className="text-gray-400">Monitoring active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* MAIN CONTENT */}
          <div className="flex-1 overflow-y-auto pr-6 py-5 min-w-0">
            <Section>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-3  mb-6">
                <StatCard
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#dc2626"
                      strokeWidth="2"
                    >
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  }
                  iconColor="text-red-600"
                  count={alerts.filter((a) => !a.acked).length}
                  countColor="text-red-600"
                  title="Firing Now"
                />
                <StatCard
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#d97706"
                      strokeWidth="2"
                    >
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    </svg>
                  }
                  iconColor="text-amber-600"
                  count={2}
                  countColor="text-amber-600"
                  title="Pending"
                />
                <StatCard
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#16a34a"
                      strokeWidth="2"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  }
                  iconColor="text-green-600"
                  count={18}
                  countColor="text-green-600"
                  title="Resolved Today"
                />
                <StatCard
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  }
                  iconColor="text-blue-600"
                  count={24}
                  countColor="text-blue-600"
                  title="Active Rules"
                />
                <StatCard
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#7c3aed"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  }
                  iconColor="text-purple-700"
                  count="18m"
                  countColor="text-purple-700"
                  title="Avg MTTR"
                />
                <StatCard
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#0891b2"
                      strokeWidth="2"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.77 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.72 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.91 5.91l.88-.88a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  }
                  iconColor="text-cyan-600"
                  count={notifCount}
                  countColor="text-cyan-600"
                  title="Notifs Sent (24h)"
                />
              </div>
            </Section>

            <Section>
              {/* TABS */}
              <div className="flex border-b-2 border-gray-200 mb-5">
                {TABS.map(({ id, label, count, prefix }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] border-b-2 -mb-0.5 transition-all whitespace-nowrap cursor-pointer
                    ${activeTab === id ? "text-blue-600 border-blue-600" : "text-gray-400 border-transparent hover:text-gray-700"}`}
                  >
                    {prefix}
                    {label}
                    <span
                      className={`text-[10.5px] font-mono px-1.5 py-0.5 rounded-full ${activeTab === id ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-400"}`}
                    >
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            </Section>

            {/* TAB CONTENT */}
            {activeTab === "active" && (
              <ActiveAlertsTab
                alerts={alerts}
                onAck={ackAlert}
                onAckAll={ackAll}
                showToast={showToast}
                openSilence={() => setSilenceModal(true)}
              />
            )}
            {activeTab === "rules" && (
              <RulesTab
                showToast={showToast}
                openRule={() => setRuleModal(true)}
              />
            )}
            {activeTab === "channels" && <ChannelsTab showToast={showToast} />}
            {activeTab === "history" && <HistoryTab showToast={showToast} />}
            {activeTab === "silences" && (
              <SilencesTab
                showToast={showToast}
                openSilence={() => setSilenceModal(true)}
              />
            )}
          </div>

          {/* LIVE FEED */}
          <LiveFeed showToast={showToast} />
        </div>
      </div>

      {/* MODALS */}
      <NewRuleModal
        isOpen={ruleModal}
        onClose={() => setRuleModal(false)}
        onSave={() => {
          setRuleModal(false);
          showToast("Alert rule created successfully");
        }}
      />
      <SilenceModal
        isOpen={silenceModal}
        onClose={() => setSilenceModal(false)}
        onSave={() => {
          setSilenceModal(false);
          showToast("Silence added — alerts muted");
        }}
      />

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-slate-800 text-white px-4 py-2.5 rounded-lg text-[13px] shadow-xl z-[9999]">
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
          {toast}
        </div>
      )}
    </div>
  );
}
