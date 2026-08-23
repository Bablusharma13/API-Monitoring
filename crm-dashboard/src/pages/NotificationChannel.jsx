import { useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import { AddIcon, RefreshIcon } from "../components/ui/Icons";
import { ActionButton } from "../components/ui/ActionButton";
import { StatCard } from "../components/ui/StatCard3";
import { Section } from "../components/ui/Section";
import { Badge } from "../components/ui/Badge";
import { Table } from "../components/TableComponents/Table";

// ── DATA ──────────────────────────────────────────────────────────────────────
const CHANNELS = [
  {
    id: "ch-01",
    type: "slack",
    name: "Slack · #alerts",
    status: "connected",
    enabled: true,
    meta: "api-monitor-crm workspace",
    sent: 142,
    failed: 1,
    lastSent: "2m ago",
    severities: ["critical", "warning"],
    color: "#611f69",
    emoji: "💬",
  },
  {
    id: "ch-02",
    type: "slack",
    name: "Slack · #infra",
    status: "connected",
    enabled: true,
    meta: "api-monitor-crm workspace",
    sent: 88,
    failed: 0,
    lastSent: "6m ago",
    severities: ["critical"],
    color: "#611f69",
    emoji: "💬",
  },
  {
    id: "ch-03",
    type: "pagerduty",
    name: "PagerDuty · ops-critical",
    status: "connected",
    enabled: true,
    meta: "ops-critical service · auto-escalation",
    sent: 24,
    failed: 0,
    lastSent: "24m ago",
    severities: ["critical"],
    color: "#06ac38",
    emoji: "📟",
  },
  {
    id: "ch-04",
    type: "email",
    name: "Email · ops@company.com",
    status: "connected",
    enabled: true,
    meta: "ops@company.com · digest mode",
    sent: 18,
    failed: 2,
    lastSent: "44m ago",
    severities: ["critical", "warning", "info"],
    color: "#4285f4",
    emoji: "📧",
  },
  {
    id: "ch-05",
    type: "email",
    name: "Email · dev@company.com",
    status: "connected",
    enabled: true,
    meta: "dev@company.com · individual",
    sent: 8,
    failed: 0,
    lastSent: "2h ago",
    severities: ["warning", "info"],
    color: "#4285f4",
    emoji: "📧",
  },
  {
    id: "ch-06",
    type: "webhook",
    name: "Webhook · Zapier",
    status: "connected",
    enabled: true,
    meta: "hooks.zapier.com · POST JSON",
    sent: 4,
    failed: 0,
    lastSent: "3h ago",
    severities: ["critical"],
    color: "#ff4a00",
    emoji: "🔗",
  },
  {
    id: "ch-07",
    type: "discord",
    name: "Discord · #monitoring",
    status: "error",
    enabled: false,
    meta: "Last error: invalid webhook URL",
    sent: 0,
    failed: 0,
    lastSent: "Never",
    severities: ["warning", "info"],
    color: "#5865f2",
    emoji: "🎮",
  },
];

const DELIVERY_EVENTS = [
  {
    t: "10:42:18",
    ch: "Slack · #alerts",
    alert: "Error rate 3.4%",
    sev: "critical",
    tenant: "Magna Cloud",
    ms: 312,
    ok: true,
    attempt: 1,
  },
  {
    t: "10:42:18",
    ch: "PagerDuty",
    alert: "Error rate 3.4%",
    sev: "critical",
    tenant: "Magna Cloud",
    ms: 688,
    ok: true,
    attempt: 1,
  },
  {
    t: "10:38:44",
    ch: "Slack · #alerts",
    alert: "CPU Saturation",
    sev: "critical",
    tenant: "Magna Cloud",
    ms: 298,
    ok: true,
    attempt: 1,
  },
  {
    t: "10:38:44",
    ch: "PagerDuty",
    alert: "CPU Saturation",
    sev: "critical",
    tenant: "Magna Cloud",
    ms: 712,
    ok: true,
    attempt: 1,
  },
  {
    t: "10:31:22",
    ch: "Slack · #alerts",
    alert: "Rate limit spike",
    sev: "warning",
    tenant: "Strata AI",
    ms: 321,
    ok: true,
    attempt: 1,
  },
  {
    t: "10:22:05",
    ch: "Email · ops@",
    alert: "Error rate 3.4%",
    sev: "critical",
    tenant: "Magna Cloud",
    ms: 1240,
    ok: false,
    attempt: 2,
  },
  {
    t: "10:22:05",
    ch: "Email · ops@",
    alert: "Error rate 3.4%",
    sev: "critical",
    tenant: "Magna Cloud",
    ms: 1820,
    ok: true,
    attempt: 3,
  },
  {
    t: "10:18:33",
    ch: "Slack · #alerts",
    alert: "p99 Latency",
    sev: "critical",
    tenant: "Pulsar Labs",
    ms: 344,
    ok: true,
    attempt: 1,
  },
  {
    t: "10:18:33",
    ch: "PagerDuty",
    alert: "p99 Latency",
    sev: "critical",
    tenant: "Pulsar Labs",
    ms: 701,
    ok: true,
    attempt: 1,
  },
  {
    t: "09:55:12",
    ch: "Webhook · Zapier",
    alert: "Quota warning",
    sev: "warning",
    tenant: "Apex Systems",
    ms: 480,
    ok: true,
    attempt: 1,
  },
  {
    t: "09:44:08",
    ch: "Slack · #alerts",
    alert: "Quota warning",
    sev: "warning",
    tenant: "Pulsar Labs",
    ms: 308,
    ok: true,
    attempt: 1,
  },
  {
    t: "09:30:01",
    ch: "Email · dev@",
    alert: "p95 Latency warn",
    sev: "info",
    tenant: "All",
    ms: 1120,
    ok: false,
    attempt: 1,
  },
];

const ROUTING = [
  {
    sev: "critical",
    signal: "Any",
    channels: ["Slack #alerts", "PagerDuty"],
    esc: "Immediately",
  },
  {
    sev: "critical",
    signal: "Errors",
    channels: ["Slack #infra", "Email ops@"],
    esc: "15 min",
  },
  { sev: "warning", signal: "Any", channels: ["Slack #alerts"], esc: "1 hour" },
  {
    sev: "warning",
    signal: "Quota",
    channels: ["Email ops@", "Webhook Zapier"],
    esc: "No escalation",
  },
  {
    sev: "info",
    signal: "Any",
    channels: ["Email dev@"],
    esc: "No escalation",
  },
];

const CHANGES = [
  {
    icon: "add",
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
    title: "Discord channel added",
    sub: "#monitoring · Rohan Sharma",
    time: "2h ago",
  },
  {
    icon: "edit",
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
    title: "PagerDuty escalation updated",
    sub: "Default → P1 policy · Arjun Kumar",
    time: "1d ago",
  },
  {
    icon: "check",
    bg: "bg-green-50",
    iconColor: "text-green-600",
    title: "Discord reconnected",
    sub: "Fixed webhook URL · Rohan Sharma",
    time: "1d ago",
  },
  {
    icon: "add",
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
    title: "Webhook · Zapier added",
    sub: "POST hooks.zapier.com · Priya Mehta",
    time: "3d ago",
  },
  {
    icon: "edit",
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
    title: "Email severity updated",
    sub: "info removed from ops@ · Arjun Kumar",
    time: "5d ago",
  },
];

const CHANNEL_TYPES = [
  { type: "slack", emoji: "💬", name: "Slack", color: "#611f69" },
  { type: "pagerduty", emoji: "📟", name: "PagerDuty", color: "#06ac38" },
  { type: "email", emoji: "📧", name: "Email", color: "#4285f4" },
  { type: "webhook", emoji: "🔗", name: "Webhook", color: "#ff4a00" },
  { type: "discord", emoji: "🎮", name: "Discord", color: "#5865f2" },
  { type: "teams", emoji: "💼", name: "MS Teams", color: "#464775" },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────
function SevBadge({ sev }) {
  const variantMap = {
    critical: "down",
    warning: "warning",
    info: "beta",
  };

  return (
    <Badge
      value={sev.charAt(0).toUpperCase() + sev.slice(1)}
      variant={variantMap[sev] ?? "default"}
    />
  );
}

function Toggle({ checked, onChange }) {
  return (
    <div
      className="relative w-9 h-5 cursor-pointer flex-shrink-0"
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
    >
      <div
        className={`absolute inset-0 rounded-full transition-colors duration-200 ${checked ? "bg-green-500" : "bg-gray-200"}`}
      />
      <div
        className={`absolute top-[3px] left-[3px] w-3.5 h-3.5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-4" : ""}`}
      />
    </div>
  );
}

function StatusDot({ status, enabled }) {
  if (status === "connected" && enabled) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)] flex-shrink-0" />
        <span className="text-[11.5px] text-green-600">Connected</span>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
        <span className="text-[11.5px] text-red-600">Error</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
      <span className="text-[11.5px] text-gray-400">Disabled</span>
    </div>
  );
}

// ── DRAWER FORM CONTENT ───────────────────────────────────────────────────────
function DrawerForm({ type }) {
  const inputCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 outline-none focus:border-blue-500 bg-white transition-colors";
  const selectCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 outline-none focus:border-blue-500 bg-white cursor-pointer";
  const Label = ({ children }) => (
    <div className="text-[12.5px] text-gray-700 mb-1">{children}</div>
  );
  const Group = ({ children }) => <div className="mb-3.5">{children}</div>;
  const Hint = ({ children }) => (
    <div className="text-[11.5px] text-gray-400 mt-1 leading-relaxed">
      {children}
    </div>
  );
  const SecDiv = ({ children }) => (
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-gray-400 mb-3 mt-1">
      {children}
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );

  if (type === "slack")
    return (
      <>
        <SecDiv>Slack configuration</SecDiv>
        <Group>
          <Label>Workspace</Label>
          <input className={inputCls} defaultValue="api-monitor-crm" />
        </Group>
        <Group>
          <Label>Channel</Label>
          <input className={inputCls} defaultValue="#alerts" />
          <Hint>Include the # prefix</Hint>
        </Group>
        <Group>
          <Label>Bot Token</Label>
          <input
            className={`${inputCls} font-mono text-[12px]`}
            type="password"
            placeholder="xoxb-••••••••••••••••••••"
          />
        </Group>
        <Group>
          <Label>
            Message template{" "}
            <span className="text-[11px] text-gray-400">(optional)</span>
          </Label>
          <textarea
            className={`${inputCls} resize-y leading-relaxed`}
            rows={2}
            placeholder="🚨 *{{severity}}*: {{title}}"
          />
        </Group>
      </>
    );

  if (type === "pagerduty")
    return (
      <>
        <SecDiv>PagerDuty configuration</SecDiv>
        <Group>
          <Label>Service name</Label>
          <input className={inputCls} defaultValue="ops-critical" />
        </Group>
        <Group>
          <Label>Integration key</Label>
          <input
            className={`${inputCls} font-mono text-[12px]`}
            type="password"
            placeholder="••••••••••••••••••••••••••••••••"
          />
          <Hint>Events API v2 integration key from your PagerDuty service</Hint>
        </Group>
        <Group>
          <Label>Escalation policy</Label>
          <select className={selectCls}>
            <option>Default escalation</option>
            <option>P1 escalation</option>
            <option>No escalation</option>
          </select>
        </Group>
        <Group>
          <Label>Auto-resolve</Label>
          <select className={selectCls}>
            <option>When alert clears</option>
            <option>After 1 hour</option>
            <option>Manual only</option>
          </select>
        </Group>
      </>
    );

  if (type === "email")
    return (
      <>
        <SecDiv>Email configuration</SecDiv>
        <Group>
          <Label>To address</Label>
          <input
            className={inputCls}
            type="email"
            defaultValue="ops@company.com"
          />
        </Group>
        <Group>
          <Label>
            CC <span className="text-[11px] text-gray-400">(optional)</span>
          </Label>
          <input
            className={inputCls}
            type="email"
            placeholder="backup@yourcompany.com"
          />
        </Group>
        <Group>
          <Label>Subject template</Label>
          <input
            className={inputCls}
            defaultValue="[API Monitor] {{severity}}: {{title}}"
          />
        </Group>
        <Group>
          <Label>Delivery mode</Label>
          <select className={selectCls}>
            <option>Immediate</option>
            <option>Digest — every 15 min</option>
            <option>Digest — every 1 hour</option>
          </select>
        </Group>
        <Group>
          <Label>From name</Label>
          <input className={inputCls} defaultValue="API Monitor Alerts" />
        </Group>
      </>
    );

  if (type === "webhook")
    return (
      <>
        <SecDiv>Webhook configuration</SecDiv>
        <Group>
          <Label>Endpoint URL</Label>
          <input
            className={`${inputCls} font-mono text-[12px]`}
            placeholder="https://hooks.yourservice.com/…"
          />
        </Group>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Group>
            <Label>Method</Label>
            <select className={selectCls}>
              <option>POST</option>
              <option>PUT</option>
            </select>
          </Group>
          <Group>
            <Label>Content-Type</Label>
            <select className={selectCls}>
              <option>application/json</option>
              <option>application/x-www-form-urlencoded</option>
            </select>
          </Group>
        </div>
        <Group>
          <Label>
            Secret / HMAC key{" "}
            <span className="text-[11px] text-gray-400">(optional)</span>
          </Label>
          <input
            className={`${inputCls} font-mono text-[12px]`}
            type="password"
            placeholder="For X-Hub-Signature validation"
          />
        </Group>
        <Group>
          <Label>
            Custom headers{" "}
            <span className="text-[11px] text-gray-400">(optional)</span>
          </Label>
          <textarea
            className={`${inputCls} font-mono text-[12px] resize-y leading-relaxed`}
            rows={3}
            placeholder={"Authorization: Bearer token\nX-Custom-Header: value"}
          />
        </Group>
      </>
    );

  if (type === "discord")
    return (
      <>
        <SecDiv>Discord configuration</SecDiv>
        <Group>
          <Label>Webhook URL</Label>
          <input
            className={`${inputCls} font-mono text-[12px]`}
            placeholder="https://discord.com/api/webhooks/…"
          />
          <Hint>
            Go to Server Settings → Integrations → Webhooks to create one
          </Hint>
        </Group>
        <Group>
          <Label>
            Username{" "}
            <span className="text-[11px] text-gray-400">(optional)</span>
          </Label>
          <input className={inputCls} defaultValue="API Monitor" />
        </Group>
        <Group>
          <Label>
            Thread name{" "}
            <span className="text-[11px] text-gray-400">(optional)</span>
          </Label>
          <input
            className={inputCls}
            placeholder="Leave blank to post in channel"
          />
        </Group>
      </>
    );

  if (type === "teams")
    return (
      <>
        <SecDiv>MS Teams configuration</SecDiv>
        <Group>
          <Label>Incoming Webhook URL</Label>
          <input
            className={`${inputCls} font-mono text-[12px]`}
            placeholder="https://companyname.webhook.office.com/…"
          />
          <Hint>Create via Teams channel → Connectors → Incoming Webhook</Hint>
        </Group>
        <Group>
          <Label>Card style</Label>
          <select className={selectCls}>
            <option>Adaptive Card (recommended)</option>
            <option>Simple message</option>
          </select>
        </Group>
      </>
    );

  return null;
}

// ── CHANNEL CARD ──────────────────────────────────────────────────────────────
function ChannelCard({ ch, onEdit, onToggle, onTest }) {
  return (
    <div
      onClick={() => onEdit(ch.id)}
      className={`bg-white border rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:border-gray-300 hover:shadow-md ${
        ch.status === "connected" && ch.enabled
          ? "border-gray-200"
          : ch.status === "error"
            ? "border-red-200"
            : "border-gray-200 opacity-70"
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-gray-100 flex items-start gap-3.5">
        <div
          className="w-11 h-11 rounded-[11px] flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: ch.color + "18" }}
        >
          {ch.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="text-[13.5px] text-gray-800 truncate">
              {ch.name}
            </div>
            <Toggle checked={ch.enabled} onChange={(v) => onToggle(ch.id, v)} />
          </div>
          <div className="text-[11.5px] text-gray-400 truncate">{ch.meta}</div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3.5 flex flex-col gap-2">
        <div className="flex justify-between items-center text-[12.5px]">
          <span className="text-gray-400">Status</span>
          <StatusDot status={ch.status} enabled={ch.enabled} />
        </div>
        <div className="flex justify-between items-center text-[12.5px]">
          <span className="text-gray-400">Sent today</span>
          <span className="font-mono text-[12px] text-gray-700">{ch.sent}</span>
        </div>
        <div className="flex justify-between items-center text-[12.5px]">
          <span className="text-gray-400">Failed</span>
          <span
            className={`font-mono text-[12px] ${ch.failed > 0 ? "text-red-600" : "text-gray-400"}`}
          >
            {ch.failed}
          </span>
        </div>
        <div className="flex justify-between items-center text-[12.5px]">
          <span className="text-gray-400">Last sent</span>
          <span className="font-mono text-[11.5px] text-gray-400">
            {ch.lastSent}
          </span>
        </div>
        <div className="flex justify-between items-start text-[12.5px]">
          <span className="text-gray-400 shrink-0">Severities</span>
          <div className="flex gap-1 flex-wrap justify-end">
            {ch.severities.map((s) => (
              <SevBadge key={s} sev={s} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/60 flex items-center gap-2">
        <ActionButton
          action="save"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(ch.id);
          }}
          label="Edit"
          icon={null}
        />

        <ActionButton
          action="search"
          onClick={(e) => {
            e.stopPropagation();
            onTest(ch.id);
          }}
          label="Test"
          icon={null}
        />
        {ch.status === "error" && (
          <span className="text-[11px] text-red-500 ml-1">⚠ Check config</span>
        )}
      </div>
    </div>
  );
}

// ── DRAWER ────────────────────────────────────────────────────────────────────
function Drawer({
  isOpen,
  mode,
  editChannelId,
  selectedType,
  setSelectedType,
  onClose,
  onSave,
}) {
  const [sevs, setSevs] = useState(["critical", "warning", "info"]);
  const [testState, setTestState] = useState(null); // null | "loading" | "success"
  const isEdit = mode === "edit";

  const toggleSev = (s) =>
    setSevs((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  const runTest = () => {
    setTestState("loading");
    setTimeout(() => setTestState("success"), 1800);
  };

  const SecDiv = ({ children }) => (
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-gray-400 mb-3 mt-5">
      {children}
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/30 z-[998] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 w-[480px] max-w-full h-full bg-white border-l border-gray-200 z-[999] flex flex-col shadow-2xl transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <div
              className="text-[15px] text-gray-800"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {isEdit ? "Edit Channel" : "Add Channel"}
            </div>
            <div className="text-[11.5px] text-gray-400 mt-0.5">
              {isEdit
                ? "Update channel configuration"
                : "Connect a notification destination"}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:border-blue-400 hover:text-blue-600 transition-colors"
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

        {/* Body */}
        <div
          className="flex-1 overflow-y-auto px-5 py-5"
          style={{ scrollbarWidth: "thin" }}
        >
          {/* Type picker — only for new */}
          {!isEdit && (
            <>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-gray-400 mb-3">
                Channel type
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-5">
                {CHANNEL_TYPES.map((t) => (
                  <button
                    key={t.type}
                    onClick={() => setSelectedType(t.type)}
                    className={`border-[1.5px] rounded-xl py-3 px-2 flex flex-col items-center gap-2 cursor-pointer transition-all ${
                      selectedType === t.type
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50/50"
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-[10px] flex items-center justify-center text-[18px]"
                      style={{ background: t.color + "18" }}
                    >
                      {t.emoji}
                    </div>
                    <div className="text-[12.5px] text-gray-700">{t.name}</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Config form */}
          <DrawerForm type={selectedType} />

          {/* Severity filter */}
          <SecDiv>Alert severity filter</SecDiv>
          <div className="flex gap-2 flex-wrap">
            {[
              {
                key: "critical",
                label: "Critical",
                activeClass: "border-red-500 bg-red-50 text-red-600",
              },
              {
                key: "warning",
                label: "Warning",
                activeClass: "border-amber-500 bg-amber-50 text-amber-600",
              },
              {
                key: "info",
                label: "Info",
                activeClass: "border-blue-500 bg-blue-50 text-blue-600",
              },
            ].map(({ key, label, activeClass }) => (
              <button
                key={key}
                onClick={() => toggleSev(key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 border-[1.5px] rounded-full text-[12px] transition-all ${
                  sevs.includes(key)
                    ? activeClass
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${key === "critical" ? "bg-red-500" : key === "warning" ? "bg-amber-500" : "bg-blue-500"}`}
                />
                {label}
              </button>
            ))}
          </div>
          <div className="text-[11.5px] text-gray-400 mt-2 leading-relaxed">
            Only alerts matching the selected severities will be sent to this
            channel.
          </div>

          {/* Cooldown */}
          <div className="mt-3.5">
            <div className="text-[12.5px] text-gray-700 mb-1.5">
              Re-notification cooldown
            </div>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 outline-none focus:border-blue-500 bg-white cursor-pointer">
              <option>No cooldown</option>
              <option selected>15 minutes</option>
              <option>1 hour</option>
              <option>4 hours</option>
            </select>
          </div>

          {/* Test connection */}
          <SecDiv>Test connection</SecDiv>
          <button
            onClick={runTest}
            disabled={testState === "loading"}
            className="w-full flex items-center justify-center gap-2 py-2 border border-green-200 rounded-lg bg-green-50 text-green-600 text-[12.5px] hover:bg-green-100 transition-colors disabled:opacity-60"
          >
            {testState === "loading" ? (
              <>
                <svg
                  className="animate-spin w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
                </svg>
                Sending…
              </>
            ) : (
              <>
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
                Send test notification
              </>
            )}
          </button>
          {testState === "success" && (
            <div className="mt-2 flex items-center gap-2 px-3 py-2.5 bg-green-50 border border-green-200 rounded-lg text-[12.5px] text-green-700">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Test delivered successfully! Check the channel.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/60 flex gap-2 flex-shrink-0">
          <button
            onClick={onSave}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 text-white text-[12.5px] rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Save channel
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2 border border-gray-200 text-[12.5px] text-gray-500 rounded-lg hover:border-gray-300 transition-colors"
          >
            Cancel
          </button>
          {isEdit && (
            <button
              onClick={onClose}
              className="px-3 py-2 border border-red-200 text-[12.5px] text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="inline mr-1"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              </svg>
              Delete
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function NotificationChannel() {
  const [channels, setChannels] = useState(CHANNELS.map((c) => ({ ...c })));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("new");
  const [editChannelId, setEditChannelId] = useState(null);
  const [selectedType, setSelectedType] = useState("slack");
  const [dlPageIndex, setDlPageIndex] = useState(0);
  const [dlPageLimit, setDlPageLimit] = useState(10);
  const [dlQuery, setDlQuery] = useState("");

  const openNew = () => {
    setDrawerMode("new");
    setSelectedType("slack");
    setEditChannelId(null);
    setDrawerOpen(true);
  };
  const openEdit = (id) => {
    const ch = channels.find((c) => c.id === id);
    if (ch) {
      setDrawerMode("edit");
      setSelectedType(ch.type);
      setEditChannelId(id);
      setDrawerOpen(true);
    }
  };
  const closeDrawer = () => setDrawerOpen(false);
  const toggleChannel = (id, val) =>
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: val } : c)),
    );
  const testChannel = (id) =>
    alert("Test notification sent! Check the channel for delivery.");

  const filteredDelivery = DELIVERY_EVENTS.filter(
    (e) =>
      e.ch.toLowerCase().includes(dlQuery.toLowerCase()) ||
      e.alert.toLowerCase().includes(dlQuery.toLowerCase()) ||
      e.tenant.toLowerCase().includes(dlQuery.toLowerCase()),
  );

  const paginatedDelivery = filteredDelivery.slice(
    dlPageIndex * dlPageLimit,
    (dlPageIndex + 1) * dlPageLimit,
  );

  const stats = [
    {
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#2563eb"
          strokeWidth="1.8"
        >
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      iconColor: "text-blue-600",
      num: "7",
      numColor: "text-blue-600",
      label: "Connected Channels",
      badgeText: "4 types in use",
      badgeTextColor: "text-blue-600",
      badgeBg: "bg-blue-50 ",
      //badge: "Active",
      //badgeCls: "bg-blue-50 text-blue-600 border border-blue-200",
    },
    {
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#16a34a"
          strokeWidth="1.8"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
      iconColor: "text-green-600",
      num: "284",
      numColor: "text-green-600",
      label: "Notifications Sent",
      badgeText: "▲ +42 vs yesterday",
      badgeTextColor: "text-green-600",
      badgeBg: "bg-green-50",
      //badge: "Today",
      //badgeCls: "bg-green-50 text-green-600 border border-green-200",
    },
    {
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#dc2626"
          strokeWidth="1.8"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
      iconColor: "text-red-600",
      num: "3",
      numColor: "text-red-600",
      label: "Delivery Failures",
      badgeText: "1.1% failure rate",
      badgeTextColor: "text-red-600",
      badgeBg: "bg-red-50",
      //badge: "Failed",
      //badgeCls: "bg-red-50 text-red-600 border border-red-200",
    },
    {
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#d97706"
          strokeWidth="1.8"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      iconColor: "text-amber-600",
      num: "420ms",
      numColor: "text-amber-600",
      label: "Avg Delivery Time",
      badgeText: "▼ −80ms vs yesterday",
      badgeTextColor: "text-amber-600",
      badgeBg: "bg-amber-50",
      //badge: "Avg",
      //badgeCls: "bg-amber-50 text-amber-600 border border-amber-200",
    },
  ];

  const changeIcons = {
    add: (
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    edit: (
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    check: (
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  };

  return (
    <div className="container-page">
      {/* ── MAIN ── */}
      <div>
        {/* Page Header */}
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <PageHeader
              className="flex flex-col gap-1.5"
              icon={
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="1.8"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              }
              iconGradient="bg-transparent"
              title="Notification Channels"
              breadcrumbs={[
                { label: "Home", href: "#" },
                { label: "Settings", href: "#" },
                { label: "Notification Channels" },
              ]}
            />

            <div className="flex items-center gap-2">
              <ActionButton
                action="save"
                //onClick={ackAll}
                label={"Refresh"}
                icon={RefreshIcon}
              />
              <ActionButton
                action="search"
                onClick={openNew}
                label={"Add Channel"}
                icon={AddIcon}
              />
            </div>
          </div>
        </div>

        <div className=" py-6 flex flex-col gap-5">
          <Section>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((s, i) => (
                <StatCard
                  key={i}
                  icon={s.icon}
                  iconColor={s.iconColor}
                  count={s.num}
                  countColor={s.numColor || "text-gray-900"}
                  title={s.label}
                  badgeText={s.badgeText}
                  badgeBg={s.badgeBg}
                  badgeTextColor={s.badgeTextColor}
                />
              ))}
            </div>
          </Section>

          <Section>
            {/* Channel Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {channels.map((ch) => (
                <ChannelCard
                  key={ch.id}
                  ch={ch}
                  onEdit={openEdit}
                  onToggle={toggleChannel}
                  onTest={testChannel}
                />
              ))}
            </div>
          </Section>

          <Section>
            {/* Delivery Log */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <Table
                group={{
                  Timeline: {
                    hex: "#d97706",
                    bg: "bg-amber-50",
                    text: "text-amber-600",
                  },
                  "Alert Info": {
                    hex: "#ea580c",
                    bg: "bg-orange-50",
                    text: "text-orange-700",
                  },
                  Delivery: {
                    hex: "#0891b2",
                    bg: "bg-cyan-50",
                    text: "text-cyan-600",
                  },
                  Status: {
                    hex: "#16a34a",
                    bg: "bg-green-50",
                    text: "text-green-700",
                  },
                }}
                columns={[
                  {
                    id: "t",
                    name: "Time",
                    width: 100,
                    group: "Timeline",
                    cell: (row) => (
                      <span className="font-mono text-[11.5px] text-gray-400">
                        {row.t}
                      </span>
                    ),
                  },
                  {
                    id: "ch",
                    name: "Channel",
                    width: 150,
                    group: "Alert Info",
                    cell: (row) => (
                      <span className="text-[12.5px] text-gray-700">
                        {row.ch}
                      </span>
                    ),
                  },
                  {
                    id: "alert",
                    name: "Alert",
                    width: 120,
                    group: "Alert Info",
                    cell: (row) => (
                      <span className="text-[12.5px] text-gray-500">
                        {row.alert}
                      </span>
                    ),
                  },
                  {
                    id: "sev",
                    name: "Severity",
                    width: 100,
                    group: "Alert Info",
                    cell: (row) => <SevBadge sev={row.sev} />,
                  },
                  {
                    id: "tenant",
                    name: "Tenant",
                    width: 130,
                    group: "Alert Info",
                    cell: (row) => (
                      <span className="text-[12.5px] text-gray-500">
                        {row.tenant}
                      </span>
                    ),
                  },
                  {
                    id: "ms",
                    name: "Delivery time",
                    width: 120,
                    group: "Delivery",
                    cell: (row) => (
                      <span
                        className={`font-mono text-[12px] ${row.ms > 1000 ? "text-amber-600" : "text-gray-700"}`}
                      >
                        {row.ms}ms
                      </span>
                    ),
                  },
                  {
                    id: "ok",
                    name: "Status",
                    width: 110,
                    group: "Status",
                    cell: (row) =>
                      row.ok ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          <span className="text-[11.5px] text-green-600">
                            Delivered
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          <span className="text-[11.5px] text-red-600">
                            Failed
                          </span>
                        </div>
                      ),
                  },
                  {
                    id: "attempt",
                    name: "Attempt",
                    width: 20,
                    group: "Status",
                    cell: (row) => (
                      <span className="font-mono text-[11.5px] text-gray-400">
                        #{row.attempt}
                      </span>
                    ),
                  },
                ]}
                tableName="delivery-log"
                data={paginatedDelivery}
                loading={false}
                enableSearch={true}
                searchInput={dlQuery}
                setSearchInput={(val) => {
                  setDlQuery(val);
                  setDlPageIndex(0);
                }}
                pageIndex={dlPageIndex}
                setPageIndex={setDlPageIndex}
                pageLimit={dlPageLimit}
                setPageLimit={setDlPageLimit}
                paginationData={{
                  totalCount: filteredDelivery.length,
                  totalPages:
                    Math.ceil(filteredDelivery.length / dlPageLimit) || 1,
                }}
                sortField={null}
                setSortField={() => {}}
                sortType={null}
                setSortType={() => {}}
                activeFilters={{}}
                setActiveFilters={() => {}}
                additionalControls={
                  <div className="flex items-center gap-2">
                    <span className="text-[11.5px] text-gray-400">
                      Last 50 events
                    </span>
                    <button className="px-2.5 py-1 border border-gray-200 rounded-md text-[11.5px] text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
                      Full log
                    </button>
                  </div>
                }
              />
            </div>
          </Section>

          <Section>
            {/* Routing + Change Log */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Routing */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
                  <div
                    className="flex items-center gap-1.5 text-[13px] text-gray-700"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
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
                    Alert → Channel Routing
                  </div>
                  <button className="px-2.5 py-1 border border-gray-200 rounded-md text-[11.5px] text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
                    Edit routing
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {[
                          "Severity",
                          "Signal",
                          "Channels",
                          "Escalate after",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 h-8 text-[10.5px] font-normal text-gray-400 text-left tracking-widest uppercase border-r border-gray-100 last:border-r-0 whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ROUTING.map((r, i) => (
                        <tr
                          key={i}
                          className="border-b border-gray-100 last:border-b-0 hover:bg-blue-50/30 transition-colors"
                        >
                          <td className="px-4 h-10">
                            <SevBadge sev={r.sev} />
                          </td>
                          <td className="px-4 h-10 text-[12.5px] text-gray-500">
                            {r.signal}
                          </td>
                          <td className="px-4 h-10">
                            <div className="flex gap-1 flex-wrap">
                              {r.channels.map((c) => (
                                <span
                                  key={c}
                                  className="text-[10.5px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 h-10 font-mono text-[11.5px] text-gray-400">
                            {r.esc}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Change Log */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/60">
                  <div
                    className="text-[13px] text-gray-700"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    Recent Changes
                  </div>
                </div>
                <div className="px-5 py-4 flex flex-col gap-0">
                  {CHANGES.map((e, i) => (
                    <div key={i} className="flex gap-3 pb-3.5 relative">
                      {i < CHANGES.length - 1 && (
                        <div className="absolute left-[13px] top-6 bottom-0 w-[2px] bg-gray-100" />
                      )}
                      <div
                        className={`w-[26px] h-[26px] rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${e.bg} ${e.iconColor}`}
                      >
                        {changeIcons[e.icon]}
                      </div>
                      <div className="flex-1 pt-0.5">
                        <div className="text-[12.5px] text-gray-800">
                          {e.title}
                        </div>
                        <div className="text-[11.5px] text-gray-400">
                          {e.sub}
                        </div>
                        <div className="text-[11px] text-gray-300 mt-0.5">
                          {e.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>

      {/* Drawer */}
      <Drawer
        isOpen={drawerOpen}
        mode={drawerMode}
        editChannelId={editChannelId}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        onClose={closeDrawer}
        onSave={closeDrawer}
      />
    </div>
  );
}
