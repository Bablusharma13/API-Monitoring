import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, ArrowUp, ArrowDown } from "lucide-react";
import UiInput from "../../../components/ui/Input";
import UiSelect from "../../../components/ui/SingleSelect";
import { METHOD_OPTIONS, METHOD_META, ASSERTION_OPERATOR_OPTIONS } from "../constants";

// Local editable shape for one step (converted to/from the backend's
// Transaction.steps[] shape by TransactionFormModal's stepToForm/buildStepPayload).
export const emptyStep = () => ({
  name: "",
  method: "GET",
  url: "",
  headers: [], // [{ key, value }]
  bodyText: "", // raw JSON text, parsed on submit
  extractVars: [], // [{ name, fromPath }]
  assertions: {
    enabled: false,
    bodyContains: [], // string[]
    jsonPathChecks: [], // [{ path, operator, expected }]
  },
});

const inputCls =
  "border border-gray-200 rounded-lg px-2.5 py-[6px] font-mono text-[12px] text-gray-800 outline-none bg-white focus:border-blue-500 transition-all placeholder:text-gray-300 w-full";
const removeBtnCls =
  "w-[26px] h-[26px] flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 transition-colors flex-shrink-0";
const addLinkCls =
  "text-[12px] text-blue-600 hover:underline flex items-center gap-1";

// ── Local key/value list (headers) — mirrors the KVList pattern in
// src/features/apiForm/components/ApiFormLayout.jsx, reimplemented here since
// that component isn't exported/shared. ────────────────────────────────────
function KVList({ rows, onChange }) {
  const add = () => onChange([...rows, { key: "", value: "" }]);
  const remove = (i) => onChange(rows.filter((_, idx) => idx !== i));
  const update = (i, field, val) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));

  return (
    <div>
      {rows.map((row, i) => (
        <div key={i} className="flex gap-2 mb-2 items-center">
          <input
            className={`${inputCls} flex-1`}
            placeholder="Key"
            value={row.key}
            onChange={(e) => update(i, "key", e.target.value)}
          />
          <input
            className={`${inputCls} flex-[1.5]`}
            placeholder="Value"
            value={row.value}
            onChange={(e) => update(i, "value", e.target.value)}
          />
          <button type="button" onClick={() => remove(i)} className={removeBtnCls}>
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className={addLinkCls}>
        <Plus size={12} /> Add Header
      </button>
    </div>
  );
}

// ── extractVars repeatable rows ─────────────────────────────────────────
function ExtractVarsList({ rows, onChange }) {
  const add = () => onChange([...rows, { name: "", fromPath: "" }]);
  const remove = (i) => onChange(rows.filter((_, idx) => idx !== i));
  const update = (i, field, val) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));

  return (
    <div>
      {rows.map((row, i) => (
        <div key={i} className="flex gap-2 mb-2 items-center">
          <input
            className={`${inputCls} flex-1`}
            placeholder="Variable name"
            value={row.name}
            onChange={(e) => update(i, "name", e.target.value)}
          />
          <input
            className={`${inputCls} flex-[1.5]`}
            placeholder="From path (e.g. data.token)"
            value={row.fromPath}
            onChange={(e) => update(i, "fromPath", e.target.value)}
          />
          <button type="button" onClick={() => remove(i)} className={removeBtnCls}>
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className={addLinkCls}>
        <Plus size={12} /> Add Variable
      </button>
      <p className="mt-1.5 text-[11px] text-gray-400">
        Later steps can reference an extracted value as {"{{name}}"} in their
        URL, headers, or body.
      </p>
    </div>
  );
}

// ── bodyContains tag input ──────────────────────────────────────────────
function TagInput({ tags, onChange }) {
  const [draft, setDraft] = useState("");
  const commit = () => {
    const v = draft.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setDraft("");
  };
  const remove = (t) => onChange(tags.filter((x) => x !== t));

  return (
    <div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 pl-2 pr-1.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[11.5px] text-blue-700"
            >
              {t}
              <button
                type="button"
                onClick={() => remove(t)}
                className="text-blue-500 hover:text-blue-700"
              >
                <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="2" y1="2" x2="10" y2="10" />
                  <line x1="10" y1="2" x2="2" y2="10" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
        }}
        onBlur={commit}
        placeholder="Type text and press Enter"
        className={inputCls}
      />
    </div>
  );
}

// ── jsonPathChecks repeatable rows ──────────────────────────────────────
function JsonPathChecksList({ rows, onChange }) {
  const add = () =>
    onChange([...rows, { path: "", operator: "equals", expected: "" }]);
  const remove = (i) => onChange(rows.filter((_, idx) => idx !== i));
  const update = (i, field, val) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));

  const selectCls =
    "border border-gray-200 rounded-lg px-2 py-[6px] text-[12px] text-gray-800 outline-none bg-white focus:border-blue-500 transition-all flex-shrink-0";

  return (
    <div>
      {rows.map((row, i) => (
        <div key={i} className="flex gap-2 mb-2 items-center">
          <input
            className={`${inputCls} flex-1`}
            placeholder="JSON path (e.g. data.status)"
            value={row.path}
            onChange={(e) => update(i, "path", e.target.value)}
          />
          <select
            className={selectCls}
            value={row.operator}
            onChange={(e) => update(i, "operator", e.target.value)}
          >
            {ASSERTION_OPERATOR_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {row.operator !== "exists" && (
            <input
              className={`${inputCls} flex-1`}
              placeholder="Expected value"
              value={row.expected}
              onChange={(e) => update(i, "expected", e.target.value)}
            />
          )}
          <button type="button" onClick={() => remove(i)} className={removeBtnCls}>
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className={addLinkCls}>
        <Plus size={12} /> Add Check
      </button>
    </div>
  );
}

// ── Assertions sub-section ────────────────────────────────────────────────
function AssertionsSection({ assertions, onChange }) {
  const update = (patch) => onChange({ ...assertions, ...patch });
  return (
    <div className="border border-gray-100 rounded-lg p-3 bg-gray-50">
      <label className="flex items-center gap-2 text-[12.5px] text-gray-700 cursor-pointer mb-3">
        <input
          type="checkbox"
          checked={assertions.enabled}
          onChange={(e) => update({ enabled: e.target.checked })}
          className="accent-blue-600"
        />
        Enable response assertions for this step
      </label>
      {assertions.enabled && (
        <div className="flex flex-col gap-3">
          <div>
            <div className="text-[11px] text-gray-500 mb-1.5">
              Response body must contain
            </div>
            <TagInput
              tags={assertions.bodyContains}
              onChange={(bodyContains) => update({ bodyContains })}
            />
          </div>
          <div>
            <div className="text-[11px] text-gray-500 mb-1.5">
              JSON path checks
            </div>
            <JsonPathChecksList
              rows={assertions.jsonPathChecks}
              onChange={(jsonPathChecks) => update({ jsonPathChecks })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── One step card ─────────────────────────────────────────────────────────
function StepCard({ step, index, total, onUpdate, onRemove, onMoveUp, onMoveDown, error }) {
  const [expanded, setExpanded] = useState(true);
  const ms = METHOD_META[step.method] || METHOD_META.GET;

  const update = (patch) => onUpdate({ ...step, ...patch });

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-b border-gray-100">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-[10.5px] font-medium flex items-center justify-center flex-shrink-0">
          {index + 1}
        </span>
        <span
          className="text-[10.5px] font-mono font-medium px-1.5 py-[1px] rounded border flex-shrink-0"
          style={{ color: ms.color, background: ms.bg, borderColor: ms.border }}
        >
          {step.method}
        </span>
        <span className="text-[12.5px] text-gray-700 truncate flex-1 min-w-0">
          {step.name || step.url || `Step ${index + 1}`}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            title="Move up"
            disabled={index === 0}
            onClick={onMoveUp}
            className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-colors"
          >
            <ArrowUp size={12} />
          </button>
          <button
            type="button"
            title="Move down"
            disabled={index === total - 1}
            onClick={onMoveDown}
            className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-colors"
          >
            <ArrowDown size={12} />
          </button>
          <button
            type="button"
            title="Remove step"
            onClick={onRemove}
            className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-3 flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] gap-3">
            <UiSelect
              label="Method"
              value={step.method}
              options={METHOD_OPTIONS}
              onChange={(e) => update({ method: e.target.value })}
            />
            <UiInput
              label="Step Name"
              required
              value={step.name}
              placeholder="e.g. Login"
              error={error?.name ? "Step name is required" : ""}
              onChange={(e) => update({ name: e.target.value })}
            />
          </div>
          <UiInput
            label="URL"
            required
            value={step.url}
            placeholder="https://api.example.com/v1/login"
            error={error?.url ? "URL is required" : ""}
            onChange={(e) => update({ url: e.target.value })}
          />

          <div>
            <div className="text-[11px] text-gray-500 mb-1.5">Headers</div>
            <KVList rows={step.headers} onChange={(headers) => update({ headers })} />
          </div>

          <div>
            <div className="text-[11px] text-gray-500 mb-1.5">
              Body <span className="text-gray-400">(raw JSON, optional)</span>
            </div>
            <textarea
              rows={4}
              value={step.bodyText}
              onChange={(e) => update({ bodyText: e.target.value })}
              placeholder='{"key": "value"}'
              className={`w-full border rounded-lg px-3 py-2 text-[12px] font-mono outline-none resize-y transition-all ${
                error?.body
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200 bg-white focus:border-blue-500"
              }`}
            />
            {error?.body && (
              <p className="mt-1 text-[11.5px] text-red-500">
                Body must be valid JSON
              </p>
            )}
          </div>

          <div>
            <div className="text-[11px] text-gray-500 mb-1.5">
              Extract variables from response
            </div>
            <ExtractVarsList
              rows={step.extractVars}
              onChange={(extractVars) => update({ extractVars })}
            />
          </div>

          <div>
            <div className="text-[11px] text-gray-500 mb-1.5">Assertions</div>
            <AssertionsSection
              assertions={step.assertions}
              onChange={(assertions) => update({ assertions })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────
export default function StepsEditor({ steps, onChange, errors = [] }) {
  const addStep = () => onChange([...steps, emptyStep()]);
  const updateStep = (i, step) =>
    onChange(steps.map((s, idx) => (idx === i ? step : s)));
  const removeStep = (i) => onChange(steps.filter((_, idx) => idx !== i));
  const moveStep = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= steps.length) return;
    const next = [...steps];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      {steps.length === 0 && (
        <div className="border border-dashed border-gray-200 rounded-xl px-4 py-6 text-center text-[12.5px] text-gray-400">
          No steps yet — add the first request this transaction should run.
        </div>
      )}
      {steps.map((step, i) => (
        <StepCard
          key={i}
          step={step}
          index={i}
          total={steps.length}
          onUpdate={(s) => updateStep(i, s)}
          onRemove={() => removeStep(i)}
          onMoveUp={() => moveStep(i, -1)}
          onMoveDown={() => moveStep(i, 1)}
          error={errors[i]}
        />
      ))}
      <button
        type="button"
        onClick={addStep}
        className="flex items-center justify-center gap-1.5 border border-dashed border-gray-300 rounded-xl py-2.5 text-[12.5px] text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors"
      >
        <Plus size={13} /> Add Step
      </button>
    </div>
  );
}
