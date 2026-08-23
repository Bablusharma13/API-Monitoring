// pages/CronMonitor/CronInventory.jsx

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  List, Plus, Download, Upload, CheckCircle, Clock,
  AlertTriangle, Pause, Activity, Shield, Copy,
  Trash2, Play, Bell, Pencil,
} from "lucide-react";

// ─── Shared UI ────────────────────────────────────────────────────────────────
import PageHeader     from "../../../components/ui/PageHeader";
import { Section }    from "../../../components/ui/Section";
import { InfoCard }   from "../../../components/ui/InfoCard";
import { StatCard }   from "../../../components/ui/StatCard3.jsx";
import Modal          from "../../../components/ui/Modal";
import NewTableConfig from "../../../components/TableComponents/TableConfig";
import { Button }     from "../../../components/ui/Button.jsx";

// ─── TaskModal — standalone, same pattern as ApiTestModal ────────────────────
import TaskModal from "../../../components/ui/TaskModal";

// ─── Columns + Hook ───────────────────────────────────────────────────────────
import { getCronInventoryColumns } from "./cronInventoryColumns.jsx";
import { useCronInventory, FILTER_OPTIONS } from "../hooks/usecronInventory.js";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  ok:     { color: "#16a34a", bg: "bg-emerald-50",  text: "text-emerald-700", border: "border-emerald-200", label: "Healthy" },
  late:   { color: "#d97706", bg: "bg-amber-50",    text: "text-amber-700",   border: "border-amber-200",   label: "Late"    },
  fail:   { color: "#dc2626", bg: "bg-red-50",      text: "text-red-700",     border: "border-red-200",     label: "Failed"  },
  paused: { color: "#6b7280", bg: "bg-gray-100",    text: "text-gray-600",    border: "border-gray-200",    label: "Paused"  },
};

const LiveDot = () => (
  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
);

function StatusBadge({ status }) {
  const s = STATUS_CFG[status] ?? STATUS_CFG.paused;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${s.bg} ${s.text} ${s.border}`}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TASK DETAIL MODAL
// ─────────────────────────────────────────────────────────────────────────────
function TaskDetailModal({ task, isOpen, onClose, onEdit, onRunNow, onShowToast }) {
  if (!task) return null;
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task.name}
      footer={
        <>
          <Button variant="outline" size="sm" icon={<Bell size={12} />}
            onClick={() => { onShowToast?.(`Alert configured for ${task.name}`); onClose(); }}>
            Alert
          </Button>
          <Button variant="outline" size="sm" icon={<Play size={12} />}
            onClick={() => { onRunNow?.(task.id); onShowToast?.(`▶ Running: ${task.name}`); onClose(); }}>
            Run Now
          </Button>
          <Button variant="primary" size="sm" icon={<Pencil size={12} />}
            onClick={() => { onEdit?.(task); onClose(); }}>
            Edit
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { l: "Uptime",   v: `${task.uptime30}%`,
              cls: task.uptime30 < 99 ? "text-amber-600" : "text-emerald-600" },
            { l: "Runs/30d", v: task.runs30?.toLocaleString(), cls: "text-blue-600"  },
            { l: "Duration", v: (() => {
                const s = task.durationSecs;
                return s < 60 ? `${s}s` : s < 3600 ? `${Math.floor(s/60)}m` : `${Math.floor(s/3600)}h`;
              })(), cls: "text-[#1c1f2e]" },
            { l: "Env", v: task.env, cls: "text-[#6b7280]" },
          ].map((x) => (
            <div key={x.l} className="p-3 bg-[#f8f9fc] rounded-lg border border-[#e9ebf0] text-center">
              <p className={`text-[18px] font-light ${x.cls}`} style={{ fontFamily: "'Outfit',sans-serif" }}>{x.v}</p>
              <p className="text-[11px] text-[#6b7280] mt-1">{x.l}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge status={task.status} />
          <span className="font-mono text-[12px] text-[#6b7280]">{task.cron}</span>
          <span className="text-[12px] text-[#6b7280]">· {task.cronHuman}</span>
        </div>
        {task.tags?.length > 0 && (
          <div>
            <p className="text-[11px] uppercase tracking-widest text-[#6b7280] mb-2">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {task.tags.map((t) => (
                <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-[#f0f2f7] text-[#6b7280]">{t}</span>
              ))}
            </div>
          </div>
        )}
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[#6b7280] mb-2">Ping URL</p>
          <div className="flex items-center gap-3 bg-[#1c1f2e] rounded-lg px-3 py-2.5">
            <span className="font-mono text-[12px] text-emerald-300 flex-1 truncate">{task.pingUrl}</span>
            <button className="text-emerald-400 hover:text-emerald-300 transition-colors"
              onClick={() => onShowToast?.("Ping URL copied")}>
              <Copy size={12} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[["Owner", task.owner], ["Category", task.category]].map(([l, v]) => (
            <div key={l}>
              <p className="text-[12px] text-[#6b7280] mb-1">{l}</p>
              <p className="text-[13px] text-[#1c1f2e]">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function CronInventory() {
  const {
    jobs, runsToday, kpi,
    toggleJob, runNow, updateCron,
    bulkEnable, bulkDisable, bulkDelete,
    tick,
  } = useCronInventory();

  const [syncSecs, setSyncSecs] = useState(4);
  useEffect(() => {
    const id = setInterval(() => {
      setSyncSecs((s) => { if (s >= 14) { tick(); return 0; } return s + 1; });
    }, 1000);
    return () => clearInterval(id);
  }, [tick]);

  // ── Table state ─────────────────────────────────────────────────────────────
  const [tablePage,    setTablePage]    = useState(1);
  const [tableLimit,   setTableLimit]   = useState(25);
  const [searchQ,      setSearchQ]      = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [envFilter,    setEnvFilter]    = useState("");
  const [catFilter,    setCatFilter]    = useState("");
  const [ownerFilter,  setOwnerFilter]  = useState("");
  const [freqFilter,   setFreqFilter]   = useState("");
  const [selectedIds,  setSelectedIds]  = useState(new Set());

  // ── Modal state ─────────────────────────────────────────────────────────────
  // Same pattern as ApiFormLayout:
  //   const [showTestModal, setShowTestModal] = useState(false);
  //   <ApiTestModal isOpen={showTestModal} onClose={() => setShowTestModal(false)} method={httpMethod} url={apiUrl} ...>
  const [showTaskModal,   setShowTaskModal]   = useState(false);
  const [editingTask,     setEditingTask]     = useState(null);   // null = Add, task obj = Edit
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailTask,      setDetailTask]      = useState(null);

  // ── Toast ───────────────────────────────────────────────────────────────────
  const [toastMsg,     setToastMsg]     = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef();
  const showToast = useCallback((msg) => {
    setToastMsg(msg); setToastVisible(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2400);
  }, []);

  // ── openAddModal — no editingTask, all props will be default values ─────────
  // mirrors HTML: onclick="openModal('modal-new')" with title "Add Cron Task"
  const openAddModal = useCallback(() => {
    setEditingTask(null);       // ← no props passed to TaskModal = blank form
    setShowTaskModal(true);
  }, []);

  // ── openEditModal — pass task as editingTask, all props pre-filled ──────────
  // mirrors HTML: editTask(id) fills m-name, m-cron, m-ping-id then openModal
  const openEditModal = useCallback((task) => {
    setEditingTask(task);       // ← all task fields passed as props to TaskModal
    setShowTaskModal(true);
  }, []);

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      if (statusFilter && j.status   !== statusFilter) return false;
      if (envFilter    && j.env      !== envFilter)    return false;
      if (catFilter    && j.category !== catFilter)    return false;
      if (ownerFilter  && j.owner    !== ownerFilter)  return false;
      if (freqFilter) {
        const c = j.cron;
        if (freqFilter === "min"   && !c.startsWith("*/"))                            return false;
        if (freqFilter === "hour"  && !c.startsWith("0 *"))                           return false;
        if (freqFilter === "day"   && !(c.startsWith("0 ") && !c.startsWith("0 *"))) return false;
        if (freqFilter === "week"  && !c.includes("* * 0"))                           return false;
        if (freqFilter === "month" && !c.includes("1 * *"))                           return false;
      }
      if (searchQ) {
        const blob = `${j.name} ${j.id} ${j.cron} ${j.cronHuman} ${j.owner} ${j.category} ${j.env} ${j.tags?.join(" ")}`.toLowerCase();
        if (!blob.includes(searchQ.toLowerCase())) return false;
      }
      return true;
    });
  }, [jobs, statusFilter, envFilter, catFilter, ownerFilter, freqFilter, searchQ]);

  const pagedData = useMemo(
    () => filtered.slice((tablePage - 1) * tableLimit, tablePage * tableLimit),
    [filtered, tablePage, tableLimit]
  );

  const columns = useMemo(
    () => getCronInventoryColumns({
      onEdit:     (row) => openEditModal(row),
      onRunNow:   (id)  => { runNow(id); showToast(`▶ Running task ${id}`); },
      onToggle:   (id, enabled) => {
        toggleJob(id, enabled);
        showToast(`${jobs.find((j) => j.id === id)?.name ?? id} ${enabled ? "enabled" : "paused"}`);
      },
      onSaveCron: (id, val) => { updateCron(id, val); showToast(`Schedule updated: ${val}`); },
    }),
    [jobs, runNow, toggleJob, updateCron, showToast, openEditModal]
  );

  const handleBulk = useCallback((action) => {
    const count = selectedIds.size;
    if (action === "enable")  { bulkEnable(selectedIds);  showToast(`${count} tasks enabled`);  }
    if (action === "disable") { bulkDisable(selectedIds); showToast(`${count} tasks disabled`); }
    if (action === "delete")  { bulkDelete(selectedIds);  showToast(`${count} tasks deleted`);  }
    if (action === "run")                                  showToast(`Running ${count} tasks…`);
    setSelectedIds(new Set()); setTablePage(1);
  }, [selectedIds, bulkEnable, bulkDisable, bulkDelete, showToast]);

  return (
    <>
      <div className="flex flex-col" style={{ height: "100vh", overflow: "hidden" }}>

        <PageHeader
          icon={<List size={20} />}
          title="Cron Inventory"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Cron",      href: "/cron"      },
          ]}
          actions={
            <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
              <div className="flex items-center gap-2 text-[12px] text-[#6b7280] bg-white border border-[#e9ebf0] rounded-lg px-3 py-[5px]">
                <LiveDot />Synced {syncSecs}s ago
              </div>
              <Button variant="outline" size="lg" icon={<Download size={13} />}
                onClick={() => showToast("Exported 124 tasks as CSV")}>Export CSV</Button>
              <Button variant="outline" size="lg" icon={<Upload size={13} />}
                onClick={() => showToast("Importing tasks…")}>Import</Button>

              {/* mirrors HTML: <button onclick="openModal('modal-new')">Add Task</button> */}
              <Button variant="primary" size="lg" icon={<Plus size={13} />} onClick={openAddModal}>
                Add Task
              </Button>
            </div>
          }
          extra={
            <div className="flex items-center gap-3 text-[11.5px]">
              <span className="text-[#6b7280]">{kpi.total} tasks registered across</span>
              <span className="font-medium text-[#1c1f2e]">6 environments</span>
            </div>
          }
        />

        <div className="flex-1 overflow-y-auto min-h-0" style={{ scrollbarWidth: "thin" }}>
          <div className="container-page pb-8">

            <Section>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-4">
                <StatCard icon={<CheckCircle size={20} stroke="#16a34a" />} count={kpi.ok}     title="Healthy"          countColor="text-emerald-600" />
                <StatCard icon={<Clock       size={20} stroke="#d97706" />} count={kpi.late}   title="Late / Warn"      countColor="text-amber-600"   />
                <StatCard icon={<AlertTriangle size={20} stroke="#dc2626"/>} count={kpi.fail}  title="Failed / Missing" countColor="text-red-600"     />
                <StatCard icon={<Pause       size={20} stroke="#6b7280" />} count={kpi.paused} title="Paused"           countColor="text-[#6b7280]"   />
                <StatCard icon={<Activity    size={20} stroke="#2563eb" />} count={runsToday.toLocaleString()} title="Runs Today" countColor="text-blue-600" />
                <StatCard icon={<Shield      size={20} stroke="#0891b2" />} count="4m 12s"     title="Avg Duration"     countColor="text-[#1c1f2e]"   />
                <StatCard icon={<Activity    size={20} stroke="#16a34a" />} count="99.2%"      title="30d Success"      countColor="text-emerald-600" />
              </div>
            </Section>

            <Section>
              <div className="text-[11px] uppercase tracking-[.1em] text-[#6b7280] mb-3 flex items-center gap-2">
                All Registered Tasks
                <div className="flex-1 h-px bg-[#e9ebf0]" />
                <span className="text-[11px] text-[#6b7280]">{filtered.length} tasks</span>
              </div>

              <InfoCard  action={
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 border border-[#e9ebf0] rounded-lg px-2.5 py-1.5 bg-white min-w-[200px]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c2c8d4" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input value={searchQ} onChange={(e) => { setSearchQ(e.target.value); setTablePage(1); }}
                      placeholder="Search name, cron, owner…"
                      className="border-none outline-none text-[12px] text-[#1c1f2e] bg-transparent w-full"
                      style={{ fontFamily: "inherit" }} />
                  </div>
                  {[
                    { value: "",       label: "All",     dot: "#2563eb" },
                    { value: "ok",     label: "Healthy", dot: "#16a34a" },
                    { value: "late",   label: "Late",    dot: "#d97706" },
                    { value: "fail",   label: "Failed",  dot: "#dc2626" },
                    { value: "paused", label: "Paused",  dot: "#6b7280" },
                  ].map(({ value, label, dot }) => (
                    <button key={value} onClick={() => { setStatusFilter(value); setTablePage(1); }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] border transition-all
                        ${statusFilter === value
                          ? "border-[#2563eb] bg-[#eff4ff] text-[#2563eb]"
                          : "border-[#e9ebf0] bg-white text-[#6b7280] hover:border-[#2563eb] hover:text-[#2563eb]"
                        }`}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot }}/>
                      {label}
                    </button>
                  ))}
                  <select value={envFilter} onChange={(e) => { setEnvFilter(e.target.value); setTablePage(1); }}
                    className="border border-[#e9ebf0] rounded-lg px-2 py-1 text-[12px] text-[#1c1f2e] bg-white outline-none cursor-pointer" style={{ fontFamily: "inherit" }}>
                    <option value="">All Environments</option>
                    {FILTER_OPTIONS.environments.map((e) => <option key={e}>{e}</option>)}
                  </select>
                  <select value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setTablePage(1); }}
                    className="border border-[#e9ebf0] rounded-lg px-2 py-1 text-[12px] text-[#1c1f2e] bg-white outline-none cursor-pointer" style={{ fontFamily: "inherit" }}>
                    <option value="">All Categories</option>
                    {FILTER_OPTIONS.categories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <select value={ownerFilter} onChange={(e) => { setOwnerFilter(e.target.value); setTablePage(1); }}
                    className="border border-[#e9ebf0] rounded-lg px-2 py-1 text-[12px] text-[#1c1f2e] bg-white outline-none cursor-pointer" style={{ fontFamily: "inherit" }}>
                    <option value="">All Owners</option>
                    {FILTER_OPTIONS.owners.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <select value={freqFilter} onChange={(e) => { setFreqFilter(e.target.value); setTablePage(1); }}
                    className="border border-[#e9ebf0] rounded-lg px-2 py-1 text-[12px] text-[#1c1f2e] bg-white outline-none cursor-pointer" style={{ fontFamily: "inherit" }}>
                    <option value="">All Schedules</option>
                    {FILTER_OPTIONS.schedules.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <button onClick={() => { setSearchQ(""); setStatusFilter(""); setEnvFilter(""); setCatFilter(""); setOwnerFilter(""); setFreqFilter(""); setTablePage(1); }}
                    className="text-[12px] text-[#6b7280] hover:text-[#1c1f2e] px-2 py-1 border border-[#e9ebf0] rounded-lg bg-white hover:border-[#c2c8d4] transition-colors">
                    Clear
                  </button>
                </div>
              }>
                {selectedIds.size > 0 && (
                  <div className="flex items-center gap-3 px-5 py-2.5 bg-blue-50 border-b border-blue-100 -mx-5">
                    <CheckCircle size={14} className="text-blue-600" />
                    <span className="text-[12.5px] text-blue-700 font-medium">{selectedIds.size} selected</span>
                    <div className="w-px h-4 bg-blue-200" />
                    <Button size="sm" variant="outline" icon={<Play size={11} />}   onClick={() => handleBulk("run")}>Run Now</Button>
                    <Button size="sm" variant="outline"                             onClick={() => handleBulk("enable")}>Enable</Button>
                    <Button size="sm" variant="outline"                             onClick={() => handleBulk("disable")}>Disable</Button>
                    <Button size="sm" variant="red"     icon={<Trash2 size={11} />} onClick={() => handleBulk("delete")}>Delete</Button>
                    <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-[12px] text-[#6b7280] hover:text-[#1c1f2e]">Deselect all</button>
                  </div>
                )}
                <div className="-mx-5 -mt-4 -mb-5">
                  <NewTableConfig
                    module="cron-inventory"
                    columns={columns}
                    data={pagedData}
                    isLoading={false}
                    onRowClick={(row) => { setDetailTask(row); setShowDetailModal(true); }}
                    currentPage={tablePage}
                    setCurrentPage={setTablePage}
                    pageLimit={tableLimit}
                    handlePageLimitChange={(l) => { setTableLimit(l); setTablePage(1); }}
                    totalResults={filtered.length}
                    totalPages={Math.ceil(filtered.length / tableLimit) || 1}
                    showRowNumbers={false}
                    plain={true}
                    selectedRows={selectedIds}
                    onRowSelect={(id, checked) => {
                      setSelectedIds((prev) => { const n = new Set(prev); checked ? n.add(id) : n.delete(id); return n; });
                    }}
                    onSelectAll={(checked) => {
                      setSelectedIds(checked ? new Set(pagedData.map((r) => r.id)) : new Set());
                    }}
                  />
                </div>
              </InfoCard>
            </Section>

          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          TASK MODAL — same usage pattern as ApiTestModal:

          ApiTestModal:
            <ApiTestModal
              isOpen={showTestModal}
              onClose={() => setShowTestModal(false)}
              method={httpMethod}          ← prop from state
              url={apiUrl}                 ← prop from state
              initialBody={reqBody}        ← prop from state
            />

          TaskModal (Add mode — editingTask is null, all props use defaults):
            <TaskModal isOpen={showTaskModal} onClose={...} />
            → renders blank form with placeholder text, same as HTML "Add Cron Task"

          TaskModal (Edit mode — editingTask has values, all fields pre-filled):
            <TaskModal isOpen={showTaskModal} onClose={...} mode="edit" taskName={task.name} cron={task.cron} ... />
            → renders populated form, same as HTML editTask() filling m-name, m-cron, m-ping-id
      ───────────────────────────────────────────────────────────────────── */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}

        // mode: "add" when editingTask=null (Add Task button), "edit" when task row clicked
        mode={editingTask ? "edit" : "add"}

        // All field props — from editingTask when editing, or omitted (defaults) when adding.
        // When editingTask is null, none of these are passed → modal shows blank/default form.
        // When editingTask is set, each field prop comes from the task object.
        {...(editingTask ? {
          taskName:        editingTask.name            ?? "",
          description:     editingTask.description     ?? "",
          cron:            editingTask.cron            ?? "",
          grace:           editingTask.grace           ?? "60s",
          env:             editingTask.env             ?? "Production",
          category:        editingTask.category        ?? "Pipeline",
          owner:           editingTask.owner           ?? "Alex M.",
          tags:            editingTask.tags?.join(", ") ?? "",
          pingId:          editingTask.pingId          ?? "task_new",
          notifySlack:     editingTask.notifySlack     ?? true,
          notifyEmail:     editingTask.notifyEmail     ?? true,
          notifyPagerDuty: editingTask.notifyPagerDuty ?? false,
          notifyWebhook:   editingTask.notifyWebhook   ?? false,
        } : {})}

        onSave={(data) => showToast(editingTask ? `Saved: ${data.taskName}` : `Task added: ${data.taskName}`)}
      />

      <TaskDetailModal
        task={detailTask}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onEdit={(t) => { setShowDetailModal(false); openEditModal(t); }}
        onRunNow={runNow}
        onShowToast={showToast}
      />

      <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-2 bg-[#1c1f2e] text-white text-[13px] px-[18px] py-2.5 rounded-lg pointer-events-none transition-opacity duration-300 max-w-[360px] ${toastVisible ? "opacity-100" : "opacity-0"}`}>
        <CheckCircle size={12} className="text-emerald-300" />
        {toastMsg}
      </div>
    </>
  );
}