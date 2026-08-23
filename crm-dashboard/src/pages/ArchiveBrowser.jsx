import { useState, useEffect, useRef, useCallback } from "react";
import PageHeader from "../components/ui/PageHeader";
import { ActionButton } from "../components/ui/ActionButton";
import { StatCard } from "../components/ui/StatCard3";
import { Badge } from "../components/ui/Badge";
import {
  ExportIcon,
  RefreshIcon,
  SearchIcon,
  ShieldIcon,
} from "../components/ui/Icons";
import { Table } from "../components/TableComponents/Table";
import SingleSelect from "../components/ui/SingleSelect";
import ActionsCell from "../components/TableComponents/ActionsCell";
import { Section } from "../components/ui/Section";

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
    amber:
      "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-500 hover:text-white",
    red: "bg-red-50 text-red-600 border-red-200 hover:bg-red-600 hover:text-white",
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

const LiveDot = () => (
  <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse inline-block shrink-0" />
);

function useToast() {
  const [toast, setToast] = useState(null);
  const t = useRef();
  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(t.current);
    t.current = setTimeout(() => setToast(null), 2600);
  }, []);
  return { toast, showToast };
}

// ── TREE DATA ─────────────────────────────────────────────────────────────────
const TREE_DATA = [
  {
    id: "root-cold",
    label: "❄️ Cold Store",
    tier: "cold",
    count: 41820,
    open: true,
    children: [
      {
        id: "cold-payments",
        label: "payments",
        tier: "cold",
        count: 18420,
        open: true,
        children: [
          {
            id: "cold-pay-2024",
            label: "2024",
            tier: "cold",
            count: 12840,
            open: false,
            children: [
              {
                id: "cold-pay-2024-03",
                label: "2024-03",
                tier: "cold",
                count: 3210,
                open: false,
              },
              {
                id: "cold-pay-2024-02",
                label: "2024-02",
                tier: "cold",
                count: 2880,
                open: false,
              },
              {
                id: "cold-pay-2024-01",
                label: "2024-01",
                tier: "cold",
                count: 6750,
                open: false,
              },
            ],
          },
          {
            id: "cold-pay-2023",
            label: "2023",
            tier: "cold",
            count: 5580,
            open: false,
          },
        ],
      },
      {
        id: "cold-auth",
        label: "auth",
        tier: "cold",
        count: 9240,
        open: false,
        children: [
          {
            id: "cold-auth-2024",
            label: "2024",
            tier: "cold",
            count: 5100,
            open: false,
          },
          {
            id: "cold-auth-2023",
            label: "2023",
            tier: "cold",
            count: 4140,
            open: false,
          },
        ],
      },
      {
        id: "cold-platform",
        label: "platform",
        tier: "cold",
        count: 8640,
        open: false,
      },
      {
        id: "cold-data",
        label: "data",
        tier: "cold",
        count: 5520,
        open: false,
      },
    ],
  },
  {
    id: "root-arch",
    label: "📦 Archive",
    tier: "archive",
    count: 6471,
    open: false,
    children: [
      {
        id: "arch-payments",
        label: "payments",
        tier: "archive",
        count: 2840,
        open: false,
      },
      {
        id: "arch-auth",
        label: "auth",
        tier: "archive",
        count: 1920,
        open: false,
      },
      {
        id: "arch-platform",
        label: "platform",
        tier: "archive",
        count: 1711,
        open: false,
      },
    ],
  },
];

function findNode(nodes, id) {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const f = findNode(n.children, id);
      if (f) return f;
    }
  }
  return null;
}

function toggleNodeOpen(nodes, id) {
  return nodes.map((n) => {
    if (n.id === id) return { ...n, open: !n.open };
    if (n.children) return { ...n, children: toggleNodeOpen(n.children, id) };
    return n;
  });
}

// ── FILE GENERATION ───────────────────────────────────────────────────────────
const FILE_TYPES = [".log.gz", ".json.zst", ".parquet", ".log.gz"];
const COMPRESSIONS = ["gzip·4.2×", "zstd·8.1×", "lz4·2.1×", "gzip·3.8×"];

function genFiles(folderId) {
  const tier = folderId.startsWith("arch") ? "archive" : "cold";
  const cat = folderId.includes("pay")
    ? "payments"
    : folderId.includes("auth")
      ? "auth"
      : folderId.includes("data")
        ? "data"
        : "platform";
  return Array.from({ length: 40 }, (_, i) => {
    const d = new Date(
      2024,
      2,
      Math.max(1, 28 - i),
      Math.floor(Math.random() * 24),
    );
    const type = FILE_TYPES[i % FILE_TYPES.length];
    const size = Math.round(Math.random() * 4800 + 200);
    const daysLeft = Math.round(Math.random() * (tier === "cold" ? 90 : 2555));
    return {
      id: `file-${folderId}-${i}`,
      name: `${cat}-logs-${String(d.getHours()).padStart(2, "0")}h-batch-${String(i + 1).padStart(3, "0")}${type}`,
      tier,
      size,
      comp: COMPRESSIONS[i % COMPRESSIONS.length],
      archived: d.toISOString().slice(0, 16).replace("T", " "),
      retention: `${daysLeft}d remaining`,
      retDays: daysLeft,
      checksum: "sha256:" + Math.random().toString(36).slice(2, 10) + "…",
      logs: Math.round(Math.random() * 220000 + 5000),
      api: ["payment-api", "auth-service", "billing-api", "user-api"][i % 4],
      level: ["error", "warn", "info"][i % 3],
    };
  });
}

function fmtSize(mb) {
  return mb > 1000 ? (mb / 1000).toFixed(2) + " GB" : mb + " MB";
}

// ── FOLDER TREE NODE ──────────────────────────────────────────────────────────
function TreeNode({ node, depth = 0, activeId, onSelect }) {
  const hasChildren = node.children && node.children.length > 0;
  const isActive = node.id === activeId;

  return (
    <>
      <div
        onClick={() => onSelect(node.id)}
        className={`flex items-center gap-1.5 py-1.5 cursor-pointer text-[12.5px] border-l-2 transition-all select-none
          ${isActive ? "bg-blue-50 text-blue-600 border-blue-500" : "text-gray-700 border-transparent hover:bg-gray-50"}`}
        style={{ paddingLeft: 12 + depth * 14 }}
      >
        {hasChildren ? (
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className={`shrink-0 transition-transform duration-150 ${node.open ? "rotate-90" : ""}`}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        ) : (
          <span className="w-2.5 shrink-0" />
        )}
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="2"
          stroke={node.tier === "cold" ? "#0891b2" : "#7c3aed"}
          className="shrink-0 opacity-70"
        >
          {hasChildren ? (
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          ) : (
            <>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </>
          )}
        </svg>
        <span className="flex-1 truncate">{node.label}</span>
        <span className="font-mono text-[10px] text-gray-400 px-1.5 py-0.5 rounded-full bg-gray-100 mr-2 shrink-0">
          {node.count > 999 ? (node.count / 1000).toFixed(1) + "k" : node.count}
        </span>
      </div>
      {hasChildren &&
        node.open &&
        node.children.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            depth={depth + 1}
            activeId={activeId}
            onSelect={onSelect}
          />
        ))}
    </>
  );
}

// ── RESTORE MODAL ─────────────────────────────────────────────────────────────
function RestoreModal({ isOpen, onClose, onStart, file }) {
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
        className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-[520px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <span className="text-[15px] font-light text-gray-800">
            Restore Archive Files
          </span>
          <button
            onClick={onClose}
            className="w-[26px] h-[26px] flex items-center justify-center border border-gray-200 rounded-md hover:border-gray-300 text-gray-400 transition-colors"
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
        <div className="px-5 py-5 flex flex-col gap-4">
          <div className="flex gap-2.5 items-start p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d97706"
              strokeWidth="2"
              className="shrink-0 mt-0.5"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            </svg>
            <div className="text-[12.5px] text-amber-700">
              Restoring from archive takes <strong>4–12 hours</strong>. Files
              will appear in Log Explorer once ready. You will be notified via
              Slack &amp; Email.
            </div>
          </div>
          <div>
            <div className="text-[12px] text-gray-400 mb-1.5">
              Files to restore
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-[12.5px]">
              <div className="flex items-center gap-2">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7c3aed"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span className="font-mono text-[12px] truncate flex-1">
                  {file ? file.name : "payments/2024-01-15/api-logs-14h.log.gz"}
                </span>
                <span className="text-[11px] text-gray-400 shrink-0">
                  {file ? fmtSize(file.size) : "2.4 GB"}
                </span>
              </div>
            </div>
          </div>
          <div>
            <div className="text-[12px] text-gray-400 mb-1.5">
              Restore to Tier
            </div>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 outline-none focus:border-blue-500 bg-white cursor-pointer">
              <option>🔥 Hot Store (immediate access, 48h)</option>
              <option>❄️ Cold Store (fast access, 90d)</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="text-[12px] text-gray-400 mb-1.5">
                Restore priority
              </div>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 outline-none focus:border-blue-500 bg-white cursor-pointer">
                <option>Standard (4–12h)</option>
                <option>Expedited (2–4h)</option>
                <option>Bulk (12–48h · cheapest)</option>
              </select>
            </div>
            <div>
              <div className="text-[12px] text-gray-400 mb-1.5">
                Keep in archive after?
              </div>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 outline-none focus:border-blue-500 bg-white cursor-pointer">
                <option>Yes — keep copy</option>
                <option>No — move only</option>
              </select>
            </div>
          </div>
          <div>
            <div className="text-[12px] text-gray-400 mb-1.5">
              Notify when ready
            </div>
            <div className="flex gap-5 flex-wrap">
              {["Email", "Slack", "PagerDuty"].map((ch, i) => (
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
              ))}
            </div>
          </div>
          <div>
            <div className="text-[12px] text-gray-400 mb-1.5">
              Reason (for audit log)
            </div>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 placeholder:text-gray-300"
              placeholder="e.g. Compliance audit Q1 2024 — finance team request"
            />
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-[12px] text-gray-400">
            Estimated cost:{" "}
            <span className="font-mono text-gray-800">$0.03</span> (Expedited
            retrieval · {file ? fmtSize(file.size) : "2.4 GB"})
          </div>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
          <ActionButton
            action="clear"
            label="Cancel"
            onClick={onClose}
            icon={null}
          />
          <ActionButton
            action="refresh"
            label="Start Restore"
            onClick={onStart}
            icon={RefreshIcon}
          />
        </div>
      </div>
    </div>
  );
}

// ── DETAIL PANEL ──────────────────────────────────────────────────────────────
function DetailPanel({ file, onClear, onRestore, showToast }) {
  if (!file) {
    return (
      <div className="w-[280px] shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
        <div className="flex items-center px-4 py-3 border-b border-gray-100 bg-[#fafbfc]">
          <span className="text-[13px] font-medium text-gray-800">
            Select a file
          </span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-5">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#d1d5db"
            strokeWidth="1.5"
          >
            <path d="M5 8h14M5 8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v.01" />
            <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
          </svg>
          <div className="text-[12px] text-gray-400 text-center">
            Click any file to
            <br />
            view details &amp; preview
          </div>
        </div>
      </div>
    );
  }

  const DetRow = ({ k, v, vClass = "" }) => (
    <div className="flex justify-between py-1.5 border-b border-gray-100 last:border-0 gap-2 text-[12px]">
      <span className="text-gray-400 shrink-0">{k}</span>
      <span
        className={`font-mono text-[11.5px] text-right break-all ${vClass || "text-gray-800"}`}
      >
        {v}
      </span>
    </div>
  );

  const levelColor = { error: "#f87171", warn: "#fbbf24", info: "#4ade80" };
  const previewLines = Array.from({ length: 5 }, (_, i) => ({
    time: file.archived.slice(11, 19),
    level: file.level,
    api: file.api,
    status: i % 2 === 0 ? "200" : "503",
  }));

  return (
    <div className="w-[280px] shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-[#fafbfc] shrink-0">
        <span className="text-[13px] font-medium text-gray-800 truncate">
          {file.name.slice(0, 24)}…
        </span>
        <button
          onClick={onClear}
          className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded text-gray-400 hover:border-blue-400 hover:text-blue-600 transition-colors ml-2 shrink-0 cursor-pointer"
        >
          <svg
            width="12"
            height="12"
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
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="px-4 py-3.5 border-b border-gray-100">
          <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-2.5">
            File Info
          </div>
          <DetRow
            k="Name"
            v={<span className="text-[10.5px]">{file.name}</span>}
          />
          <DetRow
            k="Tier"
            v={file.tier.charAt(0).toUpperCase() + file.tier.slice(1)}
          />
          <DetRow k="Size (raw)" v={fmtSize(file.size)} />
          <DetRow k="Compression" v={file.comp} />
          <DetRow k="Log entries" v={file.logs.toLocaleString()} />
          <DetRow k="API" v={file.api} />
          <DetRow k="Level" v={file.level.toUpperCase()} />
        </div>
        <div className="px-4 py-3.5 border-b border-gray-100">
          <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-2.5">
            Storage
          </div>
          <DetRow k="Archived at" v={file.archived} />
          <DetRow
            k="Retention"
            v={file.retention}
            vClass={
              file.retDays < 30
                ? "text-red-600"
                : file.retDays < 90
                  ? "text-amber-600"
                  : "text-gray-800"
            }
          />
          <DetRow
            k="Restore time"
            v={file.tier === "archive" ? "4–12h" : "<1 min"}
          />
          <DetRow
            k="Restore cost"
            v={`$${((file.size / 1000) * 0.03).toFixed(3)}`}
          />
        </div>
        <div className="px-4 py-3.5 border-b border-gray-100">
          <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-2.5">
            Integrity
          </div>
          <DetRow
            k="Checksum"
            v={<span className="text-[10.5px]">{file.checksum}</span>}
          />
          <DetRow k="Verified" v="✓ Passed" vClass="text-green-600" />
          <DetRow k="Encrypted" v="AES-256" vClass="text-green-600" />
        </div>
        <div className="px-4 py-3.5">
          <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-2.5">
            Preview (first 5 entries)
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 font-mono text-[11px] leading-[1.75] max-h-[140px] overflow-y-auto">
            {previewLines.map((l, i) => (
              <div key={i}>
                <span className="text-gray-400">{l.time}</span>{" "}
                <span style={{ color: levelColor[l.level] || "#4ade80" }}>
                  {l.level.toUpperCase().padEnd(5)}
                </span>{" "}
                <span className="text-blue-400">{l.api}</span>{" "}
                <span className="text-gray-600">
                  HTTP/{l.status} — request processed
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="px-4 py-3 border-t border-gray-100 flex flex-col gap-1.5 shrink-0">
        <ActionButton
          action="refresh"
          label="Restore to Hot"
          onClick={onRestore}
          icon={RefreshIcon}
          className=" justify-center"
        />
        <ActionButton
          action="export"
          label="Download"
          onClick={() => showToast("Downloading file…")}
          className=" justify-center"
        />
        <ActionButton
          action="enable"
          label="Verify Integrity"
          onClick={() => showToast("Integrity check passed ✓")}
          className="justify-center"
          icon={ShieldIcon}
        />

        <ActionButton
          action="delete"
          label="Delete Permanently"
          onClick={() => showToast("File deleted from archive")}
          className="justify-center"
        />
      </div>
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function ArchiveBrowser() {
  const { toast, showToast } = useToast();
  const [tree, setTree] = useState(TREE_DATA);
  const [activeId, setActiveId] = useState("cold-pay-2024-03");
  const [allFiles, setAllFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileQuery, setFileQuery] = useState("");
  const [treeQuery, setTreeQuery] = useState("");
  const [restoreModal, setRestoreModal] = useState(false);
  const [restoreJobs, setRestoreJobs] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageLimit, setPageLimit] = useState(25);
  const [sortField, setSortField] = useState(null);
  const [sortType, setSortType] = useState(null);
  const [query, setQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    const files = genFiles(activeId);
    setAllFiles(files);
    setFilteredFiles(files);
    setSelectedFiles(new Set());
    setSelectedFile(null);
    setFileQuery("");
  }, [activeId]);

  useEffect(() => {
    setFilteredFiles(
      allFiles.filter(
        (f) =>
          f.name.toLowerCase().includes(fileQuery.toLowerCase()) ||
          f.api.includes(fileQuery),
      ),
    );
  }, [fileQuery, allFiles]);

  const handleNodeSelect = (id) => {
    setTree((prev) => toggleNodeOpen(prev, id));
    setActiveId(id);
  };

  const startRestore = () => {
    setRestoreModal(false);
    const jobId = "rst-" + Date.now();
    const newJob = {
      id: jobId,
      name: selectedFile
        ? selectedFile.name
        : "payments/2024-01-15/api-logs-14h.log.gz",
      pct: 0,
      eta: "Initialising…",
    };
    setRestoreJobs((prev) => [...prev, newJob]);
    showToast("Restore job queued — you will be notified when ready");
    const iv = setInterval(() => {
      setRestoreJobs((prev) => {
        const updated = prev.map((j) => {
          if (j.id !== jobId) return j;
          const pct = Math.min(100, j.pct + Math.round(Math.random() * 4 + 1));
          return {
            ...j,
            pct,
            eta:
              pct < 100
                ? `~${Math.round((100 - pct) / 3)} min remaining`
                : "Complete ✓",
          };
        });
        const done = updated.find((j) => j.id === jobId && j.pct >= 100);
        if (done) {
          clearInterval(iv);
          setTimeout(() => {
            setRestoreJobs((p) => p.filter((j) => j.id !== jobId));
            showToast("Restore complete — file available in Hot Store");
          }, 4000);
        }
        return updated;
      });
    }, 800);
  };

  const getBreadcrumb = () => {
    const node = findNode(tree, activeId);
    return [
      { label: "Archive" },
      { label: activeId.startsWith("arch") ? "📦 Archive" : "❄️ Cold Store" },
      { label: node?.label || activeId },
    ];
  };

  const TierBadge = ({ tier }) =>
    tier === "archive" ? (
      <Badge variant="Test" value="Archive" />
    ) : (
      <Badge variant="Go" value="Cold" />
    );

  const FileIcon = ({ name }) => {
    const col = name.endsWith(".parquet")
      ? "#7c3aed"
      : name.endsWith(".zst")
        ? "#0891b2"
        : "#6b7280";
    return (
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
        style={{ background: col + "18" }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke={col}
          strokeWidth="2"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </div>
    );
  };

  const page = filteredFiles.slice(0, 25);
  const selCount = selectedFiles.size;

  const ARCHIVE_GROUPS = {
    "File Info": { hex: "#e11d48", bg: "bg-rose-50", text: "text-rose-700" },
    Storage: { hex: "#0891b2", bg: "bg-cyan-50", text: "text-cyan-600" },
    Integrity: { hex: "#16a34a", bg: "bg-green-50", text: "text-green-700" },
    Actions: { hex: "#7c3aed", bg: "bg-purple-50", text: "text-purple-700" },
  };

  const fileColumns = [
    {
      id: "name",
      name: "Name",
      width: 260,
      group: "File Info",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <FileIcon name={row.name} />
          <span
            className="font-mono text-[11.5px] text-gray-800 truncate"
            title={row.name}
          >
            {row.name}
          </span>
        </div>
      ),
    },
    {
      id: "tier",
      name: "Tier",
      group: "File Info",
      width: 110,
      cell: (row) => <TierBadge tier={row.tier} />,
    },
    {
      id: "size",
      name: "Size",
      width: 100,
      group: "Storage",
      cell: (row) => (
        <span className="font-mono text-[12px]">{fmtSize(row.size)}</span>
      ),
    },
    {
      id: "comp",
      name: "Compression",
      width: 130,
      group: "Storage",
      cell: (row) => (
        <span className="font-mono text-[11px] text-gray-400">{row.comp}</span>
      ),
    },
    {
      id: "archived",
      name: "Archived",
      width: 140,
      group: "Storage",
      cell: (row) => (
        <span className="font-mono text-[11px] text-gray-400">
          {row.archived}
        </span>
      ),
    },
    {
      id: "retention",
      name: "Retention",
      group: "Storage",
      width: 130,
      cell: (row) => (
        <span
          className={`text-[12px] ${row.retDays < 30 ? "text-red-600" : row.retDays < 90 ? "text-amber-600" : "text-gray-400"}`}
        >
          {row.retention}
        </span>
      ),
    },
    {
      id: "checksum",
      name: "Checksum",
      group: "Integrity",
      width: 160,
      cell: (row) => (
        <span className="font-mono text-[10.5px] text-gray-400">
          {row.checksum}
        </span>
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

  // paginated data
  const paginatedFiles = filteredFiles.slice(
    pageIndex * pageLimit,
    (pageIndex + 1) * pageLimit,
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f6fa] text-[#1c1f2e] text-sm antialiased container-page">
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* ── PAGE HEADER ── */}
        <div className=" pb-3.5 shrink-0">
          {/* Title + action buttons */}
          <div className="flex items-center justify-between gap-4">
            <PageHeader
              className="flex flex-col gap-1.5"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7c3aed"
                  strokeWidth="2"
                >
                  <path d="M5 8h14M5 8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v.01" />
                  <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
                  <line x1="10" y1="12" x2="14" y2="12" />
                </svg>
              }
              iconGradient="bg-transparent"
              title="Archive Browser"
              breadcrumbs={[
                { label: "Dashboard", href: "#" },
                { label: "Pipeline", href: "#" },
                { label: "Archive Browser" },
              ]}
            />

            <div>
              <div className="flex items-center gap-2">
                <ActionButton
                  action="save"
                  onClick={() => showToast("Searching across all tiers…")}
                  label={"Global Search"}
                  icon={SearchIcon}
                />
                <ActionButton
                  action="save"
                  onClick={() => showToast("Audit log exported")}
                  label={"Export Audit Log"}
                  icon={ExportIcon}
                />

                <ActionButton
                  action="refresh"
                  onClick={() => setRestoreModal(true)}
                  label={"Restore Selection"}
                  icon={RefreshIcon}
                />
              </div>

              <div className="flex items-center justify-end gap-1.5 pt-1.5 text-[11.5px]">
                <LiveDot />
                <span className="text-gray-500">
                  {restoreJobs.length > 0
                    ? `${restoreJobs.length} restore${restoreJobs.length !== 1 ? "s" : ""} in progress`
                    : "2 restores in progress"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Section>
          {/* ── KPI BAR ── */}
          <div className=" py-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 shrink-0">
            <StatCard
              icon={
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0891b2"
                  strokeWidth="2"
                >
                  <path d="M12 2v20M4.93 4.93l14.14 14.14M2 12h20M4.93 19.07l14.14-14.14" />
                </svg>
              }
              iconColor="text-cyan-600"
              count="2.8 TB"
              countColor="text-cyan-600"
              title="Cold Store"
            />
            <StatCard
              icon={
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7c3aed"
                  strokeWidth="2"
                >
                  <path d="M5 8h14M5 8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v.01" />
                  <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
                </svg>
              }
              iconColor="text-purple-600"
              count="184 GB"
              countColor="text-purple-600"
              title="Archive"
            />
            <StatCard
              icon={
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6b7280"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              }
              iconColor="text-gray-500"
              count="48,291"
              title="Total Files"
            />
            <StatCard
              icon={
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="2"
                >
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
              }
              iconColor="text-green-600"
              count="14"
              countColor="text-green-600"
              title="Restored (30d)"
            />
            <StatCard
              icon={
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              }
              iconColor="text-amber-600"
              count="4–12h"
              countColor="text-amber-600"
              title="Restore Time"
            />
            <StatCard
              icon={
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7c3aed"
                  strokeWidth="2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              }
              iconColor="text-purple-600"
              count="SOC2"
              countColor="text-purple-600"
              title="Compliance"
            />
          </div>
        </Section>

        <Section>
          {/* ── THREE-COLUMN BODY ── */}
          <div className="flex flex-1 overflow-hidden min-h-0 mt-4 border border-gray-200 rounded-xl">
            {/* FOLDER TREE */}
            <div className="w-[240px] shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-hidden">
              <div className="px-3.5 py-2.5 border-b border-gray-100 bg-[#fafbfc] shrink-0">
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus-within:border-blue-500 transition-colors">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#c2c8d4"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    value={treeQuery}
                    onChange={(e) => setTreeQuery(e.target.value)}
                    placeholder="Filter folders…"
                    className="border-0 outline-none text-[12px] text-gray-800 bg-transparent placeholder:text-gray-300 w-full"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto py-1.5">
                {tree.map((node) => {
                  const matchFilter = (n) =>
                    !treeQuery ||
                    n.label.toLowerCase().includes(treeQuery.toLowerCase()) ||
                    (n.children && n.children.some(matchFilter));
                  if (!matchFilter(node)) return null;
                  return (
                    <TreeNode
                      key={node.id}
                      node={node}
                      depth={0}
                      activeId={activeId}
                      onSelect={handleNodeSelect}
                    />
                  );
                })}
              </div>
              <div className="px-3.5 py-3 border-t border-gray-100 bg-[#fafbfc] shrink-0">
                <div className="text-[11px] text-gray-400 mb-2">
                  Storage used
                </div>
                <div className="flex justify-between text-[11.5px] mb-1">
                  <span className="text-cyan-500">Cold</span>
                  <span className="font-mono text-[11px] text-gray-400">
                    2.8 TB / 10 TB
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-cyan-500 rounded-full"
                    style={{ width: "28%" }}
                  />
                </div>
                <div className="flex justify-between text-[11.5px] mb-1">
                  <span className="text-purple-600">Archive</span>
                  <span className="font-mono text-[11px] text-gray-400">
                    184 GB / 1 TB
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: "18%" }}
                  />
                </div>
              </div>
            </div>

            {/* FILE LIST */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
              {/* Toolbar */}
              <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-[#fafbfc] shrink-0 flex-wrap">
                {/* Folder breadcrumb path */}
                <div className="flex items-center gap-1 py-1.5  text-[12px] text-gray-400 shrink-0 overflow-x-auto whitespace-nowrap">
                  {getBreadcrumb().map((crumb, i, arr) => (
                    <span key={i} className="flex items-center gap-1">
                      {i > 0 && <span className="opacity-35 mx-0.5">/</span>}
                      {i < arr.length - 1 ? (
                        <button className="text-blue-600 hover:opacity-75 transition-opacity">
                          {crumb.label}
                        </button>
                      ) : (
                        <span className="text-gray-700">{crumb.label}</span>
                      )}
                    </span>
                  ))}
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-[11px] text-gray-400">
                    {filteredFiles.length.toLocaleString()} files
                  </span>
                </div>
              </div>

              {/* FILE LIST */}
              <div className="flex-1 flex flex-col overflow-hidden min-w-0 ">
                {/* Active restore progress */}
                {restoreJobs.length > 0 && (
                  <div className="bg-amber-50 border-b border-amber-200 py-2 px-4 shrink-0 space-y-2">
                    {restoreJobs.map((job) => (
                      <div
                        key={job.id}
                        className="bg-white border border-amber-200 rounded-xl p-3"
                      >
                        <div className="text-[12.5px] font-medium text-gray-800 mb-1.5 truncate">
                          🔄 Restoring: {job.name}
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-700"
                            style={{ width: `${job.pct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-gray-400">
                          <span>{job.pct}%</span>
                          <span>{job.eta}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Table */}
                <div className="flex-1 overflow-y-auto min-h-0">
                  <Table
                    columns={fileColumns}
                    tableName="archive-files"
                    group={ARCHIVE_GROUPS}
                    data={paginatedFiles}
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
                      totalCount: filteredFiles.length,
                      totalPages:
                        Math.ceil(filteredFiles.length / pageLimit) || 1,
                    }}
                    onRowClick={(row) => setSelectedFile(row)}
                    selectable={true}
                    onSelectionChange={(rows) =>
                      setSelectedFiles(new Set(rows.map((r) => r.id)))
                    }
                    sortField={sortField}
                    setSortField={setSortField}
                    sortType={sortType}
                    setSortType={setSortType}
                    activeFilters={{}}
                    setActiveFilters={() => {}}
                    additionalControls={
                      <div className="flex items-center gap-2">
                        <SingleSelect
                          value={tierFilter}
                          onChange={(val) => {
                            setTierFilter(val);
                            setFilteredFiles(
                              val
                                ? allFiles.filter((f) => f.tier === val)
                                : [...allFiles],
                            );
                            setPageIndex(0);
                          }}
                          placeholder="All Tiers"
                          className="border-gray-200"
                          options={[
                            { value: "", label: "All Tiers" },
                            { value: "cold", label: "Cold", dot: "#0891b2" },
                            {
                              value: "archive",
                              label: "Archive",
                              dot: "#7c3aed",
                            },
                          ]}
                        />
                        <SingleSelect
                          value={typeFilter}
                          onChange={(val) => {
                            setTypeFilter(val);
                            const extMap = {
                              log: ".log.gz",
                              json: ".zst",
                              parquet: ".parquet",
                            };
                            setFilteredFiles(
                              val
                                ? allFiles.filter((f) =>
                                    f.name.endsWith(extMap[val]),
                                  )
                                : [...allFiles],
                            );
                            setPageIndex(0);
                          }}
                          placeholder="All Types"
                          className="border-gray-200"
                          options={[
                            { value: "", label: "All Types" },
                            { value: "log", label: ".log.gz" },
                            { value: "json", label: ".json.zst" },
                            { value: "parquet", label: ".parquet" },
                          ]}
                        />
                        {selCount > 0 && (
                          <Btn size="sm" onClick={() => setRestoreModal(true)}>
                            <svg
                              width="11"
                              height="11"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="23 4 23 10 17 10" />
                              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                            </svg>
                            Restore Selected ({selCount})
                          </Btn>
                        )}
                      </div>
                    }
                  />
                </div>
              </div>
            </div>

            {/* DETAIL PANEL */}
            <DetailPanel
              file={selectedFile}
              onClear={() => setSelectedFile(null)}
              onRestore={() => setRestoreModal(true)}
              showToast={showToast}
            />
          </div>
        </Section>
      </div>

      <RestoreModal
        isOpen={restoreModal}
        onClose={() => setRestoreModal(false)}
        onStart={startRestore}
        file={selectedFile}
      />

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
