// components/ui/TaskModal.jsx
//
// Mirrors ApiTestModal pattern EXACTLY:
//   - if (!isOpen) return null           ← same early return guard
//   - All form fields received as props  ← same as method, url, initialBody
//   - useState(propValue) for each field ← same as useState(initialBody)
//   - No internal Modal wrapper          ← renders its own overlay like ApiTestModal
//
// Usage (Add mode — blank form):
//   <TaskModal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} onSave={handleSave} />
//
// Usage (Edit mode — pre-filled):
//   <TaskModal
//     isOpen={showTaskModal}
//     onClose={() => setShowTaskModal(false)}
//     onSave={handleSave}
//     mode="edit"
//     taskName={task.name}
//     description={task.description}
//     cron={task.cron}
//     grace={task.grace}
//     env={task.env}
//     category={task.category}
//     owner={task.owner}
//     tags={task.tags?.join(", ")}
//     pingId={task.pingId}
//     notifySlack={task.notifySlack}
//     notifyEmail={task.notifyEmail}
//     notifyPagerDuty={task.notifyPagerDuty}
//     notifyWebhook={task.notifyWebhook}
//   />

import { useState } from "react";
import { Copy, Save } from "lucide-react";
import FormModal from "./FormModal";

// ─── Filter option lists (import from your hook if preferred) ─────────────────
const ENVIRONMENTS = ["Production", "Staging", "Dev", "CI/CD", "Data", "Infra"];
const CATEGORIES   = ["Pipeline", "Storage", "Monitoring", "Security", "Data", "Billing", "Notifications", "Infra", "Cleanup"];
const OWNERS       = ["Alex M.", "Sara R.", "James L.", "Priya K.", "DevOps", "Platform"];
const GRACE_OPTS   = ["30s", "60s", "2 min", "5 min", "15 min"];

// ─────────────────────────────────────────────────────────────────────────────
// TaskModal
// ─────────────────────────────────────────────────────────────────────────────
export default function TaskModal({
  // ── open / close — same as ApiTestModal ──────────────────────────────────
  isOpen,
  onClose,
  onSave,

  // ── mode flag: "add" | "edit" — drives title ─────────────────────────────
  mode = "add",

  // ── All form field props with defaults (same as ApiTestModal's method/url/initialBody) ──
  // Each prop = one field in the HTML modal
  taskName        = "",           // <input id="m-name">
  description     = "",           // <input id="m-desc">
  cron            = "",           // <input id="m-cron">
  grace           = "60s",        // <select id="m-grace">  default: 60s
  env             = "Production", // <select id="m-env">    default: Production
  category        = "Pipeline",   // <select id="m-cat">    default: Pipeline
  owner           = "Alex M.",    // <select id="m-owner">  default: Alex M.
  tags            = "",           // <input id="m-tags">
  pingId          = "task_new",   // <span id="m-ping-id">  default: task_new
  notifySlack     = true,         // <input checked> Slack   — checked by default in HTML
  notifyEmail     = true,         // <input checked> Email   — checked by default in HTML
  notifyPagerDuty = false,        // <input> PagerDuty       — unchecked by default
  notifyWebhook   = false,        // <input> Webhook         — unchecked by default
}) {
  // ── Same pattern as ApiTestModal: useState(propValue) for each field ──────
  // ApiTestModal does: const [body, setBody] = useState(initialBody)
  // We do the same for every form field:
  const [fName,    setFName]    = useState(taskName);
  const [fDesc,    setFDesc]    = useState(description);
  const [fCron,    setFCron]    = useState(cron);
  const [fGrace,   setFGrace]   = useState(grace);
  const [fEnv,     setFEnv]     = useState(env);
  const [fCat,     setFCat]     = useState(category);
  const [fOwner,   setFOwner]   = useState(owner);
  const [fTags,    setFTags]    = useState(tags);
  const [fSlack,   setFSlack]   = useState(notifySlack);
  const [fEmail,   setFEmail]   = useState(notifyEmail);
  const [fPager,   setFPager]   = useState(notifyPagerDuty);
  const [fWebhook, setFWebhook] = useState(notifyWebhook);

  // Validation state
  const [nameErr, setNameErr] = useState(false);
  const [cronErr, setCronErr] = useState(false);

  // ── Same early-return guard as ApiTestModal: if (!isOpen) return null ─────
  if (!isOpen) return null;

  // ── Ping URL derived from pingId prop ─────────────────────────────────────
  const resolvedPingId = pingId || "task_new";
  const pingUrl = `https://hb.syberfort.io/ping/${resolvedPingId}`;

  // ── Save handler — mirrors ApiTestModal's runTest() ───────────────────────
  const handleSave = () => {
    const nameOk = fName.trim().length > 0;
    const cronOk = fCron.trim().length > 0;
    setNameErr(!nameOk);
    setCronErr(!cronOk);
    if (!nameOk || !cronOk) return;

    onSave?.({
      taskName:        fName.trim(),
      description:     fDesc,
      cron:            fCron.trim(),
      grace:           fGrace,
      env:             fEnv,
      category:        fCat,
      owner:           fOwner,
      tags:            fTags.split(",").map((t) => t.trim()).filter(Boolean),
      pingId:          resolvedPingId,
      notifySlack:     fSlack,
      notifyEmail:     fEmail,
      notifyPagerDuty: fPager,
      notifyWebhook:   fWebhook,
    });
    onClose();
  };

  // ── Shared class strings ──────────────────────────────────────────────────
  const inp = (err) =>
    `w-full border ${err ? "border-red-400 bg-red-50" : "border-[#e9ebf0]"} rounded-lg px-3 py-[7px] text-[13px] text-[#1c1f2e] bg-white outline-none focus:border-[#2563eb] focus:shadow-[0_0_0_3px_rgba(37,99,235,.08)] transition-all placeholder:text-[#c2c8d4]`;
  const sel =
    "w-full border border-[#e9ebf0] rounded-lg px-3 py-[7px] text-[13px] text-[#1c1f2e] bg-white outline-none focus:border-[#2563eb] cursor-pointer transition-colors";
  const lbl = "text-[12px] text-[#6b7280] mb-[5px] block";

  // ── Title — same logic as HTML's modal-new-title ──────────────────────────
  const title = mode === "edit" ? `Edit Task — ${taskName}` : "Add Cron Task";

  // ─────────────────────────────────────────────────────────────────────────
  // Render — same overlay structure as ApiTestModal
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} className="form-modal-btn">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="form-modal-btn form-modal-btn-primary"
          >
            <Save size={13} />
            {mode === "edit" ? "Save Changes" : "Save Task"}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">

          {/* ── Task Name — <input id="m-name"> ── */}
          <div>
            <label className={lbl}>
              Task Name <span className="text-red-500">*</span>
            </label>
            <input
              value={fName}
              onChange={(e) => { setFName(e.target.value); setNameErr(false); }}
              placeholder="e.g. Log Rotation — Hot to Cold"
              className={inp(nameErr)}
              style={{ fontFamily: "inherit" }}
            />
            {nameErr && (
              <p className="mt-1 text-[11.5px] text-red-500">Task name is required</p>
            )}
          </div>

          {/* ── Description — <input id="m-desc"> ── */}
          <div>
            <label className={lbl}>Description</label>
            <input
              value={fDesc}
              onChange={(e) => setFDesc(e.target.value)}
              placeholder="What does this task do?"
              className={inp(false)}
              style={{ fontFamily: "inherit" }}
            />
          </div>

          {/* ── Cron + Grace — .g2 row from HTML ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={lbl}>
                Cron Expression <span className="text-red-500">*</span>
              </label>
              <input
                value={fCron}
                onChange={(e) => { setFCron(e.target.value); setCronErr(false); }}
                placeholder="0 * * * *"
                className={`${inp(cronErr)} font-mono`}
              />
              {cronErr && (
                <p className="mt-1 text-[11.5px] text-red-500">Cron expression is required</p>
              )}
            </div>
            {/* <select id="m-grace"> */}
            <div>
              <label className={lbl}>Grace Period</label>
              <select value={fGrace} onChange={(e) => setFGrace(e.target.value)} className={sel} style={{ fontFamily: "inherit" }}>
                {GRACE_OPTS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* ── Environment / Category / Owner — .g3 row from HTML ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* <select id="m-env"> */}
            <div>
              <label className={lbl}>Environment</label>
              <select value={fEnv} onChange={(e) => setFEnv(e.target.value)} className={sel} style={{ fontFamily: "inherit" }}>
                {ENVIRONMENTS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            {/* <select id="m-cat"> */}
            <div>
              <label className={lbl}>Category</label>
              <select value={fCat} onChange={(e) => setFCat(e.target.value)} className={sel} style={{ fontFamily: "inherit" }}>
                {CATEGORIES.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            {/* <select id="m-owner"> */}
            <div>
              <label className={lbl}>Owner</label>
              <select value={fOwner} onChange={(e) => setFOwner(e.target.value)} className={sel} style={{ fontFamily: "inherit" }}>
                {OWNERS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* ── Tags — <input id="m-tags"> ── */}
          <div>
            <label className={lbl}>Tags (comma-separated)</label>
            <input
              value={fTags}
              onChange={(e) => setFTags(e.target.value)}
              placeholder="pipeline, storage, critical"
              className={inp(false)}
              style={{ fontFamily: "inherit" }}
            />
          </div>

          {/* ── Heartbeat Ping URL — .ping-url-box from HTML ── */}
          <div>
            <label className={lbl}>Heartbeat Ping URL (auto-generated)</label>
            {/* mirrors: class="ping-url-box" */}
            <div className="flex items-center justify-between gap-2 bg-[#1c1f2e] rounded-lg px-3 py-[9px] overflow-hidden">
              <span className="font-mono text-[11.5px] text-emerald-300 truncate flex-1 overflow-hidden">
                {/* mirrors: https://hb.syberfort.io/ping/<span id="m-ping-id"> */}
                https://hb.syberfort.io/ping/
                <span className="text-yellow-300">{resolvedPingId}</span>
              </span>
              {/* mirrors: copy button */}
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(pingUrl).catch(() => {})}
                className="text-emerald-400 hover:text-emerald-300 transition-colors flex-shrink-0 bg-transparent border-none cursor-pointer"
                title="Copy ping URL"
              >
                <Copy size={11} />
              </button>
            </div>
            {/* mirrors: "Append to your cron command: && curl -s URL" */}
            <p className="mt-[5px] text-[11px] text-[#6b7280]">
              Append to your cron command:{" "}
              <code className="font-mono text-[10.5px] bg-[#f3f4f6] px-[5px] py-px rounded text-[#1c1f2e]">
                &amp;&amp; curl -s {pingUrl}
              </code>
            </p>
          </div>

          {/* ── Notify on failure — checkbox group from HTML ── */}
          <div>
            <label className={lbl}>Notify on failure via</label>
            {/* mirrors HTML: display:flex;gap:14px;flex-wrap:wrap */}
            <div className="flex items-center gap-5 flex-wrap mt-1">
              {/* mirrors: <input type="checkbox" checked> Slack */}
              <label className="flex items-center gap-[6px] text-[13px] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={fSlack}
                  onChange={(e) => setFSlack(e.target.checked)}
                  className="cursor-pointer w-[14px] h-[14px]"
                  style={{ accentColor: "#2563eb" }}
                />
                Slack
              </label>
              {/* mirrors: <input type="checkbox" checked> Email */}
              <label className="flex items-center gap-[6px] text-[13px] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={fEmail}
                  onChange={(e) => setFEmail(e.target.checked)}
                  className="cursor-pointer w-[14px] h-[14px]"
                  style={{ accentColor: "#2563eb" }}
                />
                Email
              </label>
              {/* mirrors: <input type="checkbox"> PagerDuty */}
              <label className="flex items-center gap-[6px] text-[13px] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={fPager}
                  onChange={(e) => setFPager(e.target.checked)}
                  className="cursor-pointer w-[14px] h-[14px]"
                  style={{ accentColor: "#2563eb" }}
                />
                PagerDuty
              </label>
              {/* mirrors: <input type="checkbox"> Webhook */}
              <label className="flex items-center gap-[6px] text-[13px] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={fWebhook}
                  onChange={(e) => setFWebhook(e.target.checked)}
                  className="cursor-pointer w-[14px] h-[14px]"
                  style={{ accentColor: "#2563eb" }}
                />
                Webhook
              </label>
            </div>
          </div>

        </div>
    </FormModal>
  );
}