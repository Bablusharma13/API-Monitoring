import { useState } from "react";
import { toast } from "sonner";
import { Activity, Radio, Database, Layers, History } from "lucide-react";
import PageHeader from "../../../components/ui/PageHeader";
import { Section } from "../../../components/ui/Section";
import { StatCard } from "../../../components/ui/StatCard3";
import { ActionButton } from "../../../components/ui/ActionButton";
import UiInput from "../../../components/ui/Input";
import { ClockIcon } from "../../../components/ui/AppIcons";
import { formatDateTime } from "../../../utils/helpers";
import { useRetentionSettingsQuery } from "../hooks/query/useRetentionSettingsQuery";
import { useUpdateRetentionSettingMutation } from "../hooks/query/useUpdateRetentionSettingMutation";

// ── SETTING METADATA ─────────────────────────────────────────────────────────
// Purely presentational context for the 3 real keys the backend understands.
// No fabricated data — everything numeric on screen comes from the API.
const SETTINGS_META = {
  check_retention_days: {
    order: 0,
    label: "API Check Retention",
    description:
      "How long individual API check results are kept before they expire.",
    icon: Activity,
    text: "text-blue-600",
    bg: "bg-blue-50",
    stroke: "#2563eb",
    supportsRetroactive: true,
  },
  ping_retention_days: {
    order: 1,
    label: "Cron Ping Retention",
    description:
      "How long inbound cron heartbeat ping records are kept before they expire.",
    icon: Radio,
    text: "text-cyan-600",
    bg: "bg-cyan-50",
    stroke: "#0891b2",
    supportsRetroactive: true,
  },
  tenant_metric_retention_days: {
    order: 2,
    label: "Tenant Metric Retention",
    description:
      "TTL window for tenant analytics metrics. Saving updates the live MongoDB TTL index immediately.",
    icon: Database,
    text: "text-purple-700",
    bg: "bg-purple-50",
    stroke: "#7c3aed",
    supportsRetroactive: false,
  },
};

// ── SETTING CARD ──────────────────────────────────────────────────────────────
function SettingCard({ setting, isEditing, isSaving, onEdit, onCancel, onSave }) {
  const meta = SETTINGS_META[setting.key] || {};
  const Icon = meta.icon || Database;
  const [formValue, setFormValue] = useState(String(setting.valueDays));
  const [applyRetroactively, setApplyRetroactively] = useState(false);

  const startEdit = () => {
    setFormValue(String(setting.valueDays));
    setApplyRetroactively(false);
    onEdit(setting.key);
  };

  const submit = () => {
    const valueDays = Number(formValue);
    if (!Number.isFinite(valueDays) || valueDays <= 0) {
      toast.error("Enter a valid number of days greater than 0");
      return;
    }
    onSave(setting.key, { valueDays, applyRetroactively });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div
        className={`px-4 py-3.5 border-b border-gray-200 flex items-center gap-2.5 ${meta.bg}`}
      >
        <div
          className={`w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0 ${meta.bg}`}
        >
          <Icon size={16} color={meta.stroke} strokeWidth={2} />
        </div>
        <div>
          <div className={`text-[13px] font-medium ${meta.text}`}>
            {meta.label}
          </div>
          <div className="text-[10px] text-gray-400 font-mono">
            {setting.key}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-3">
        <div className="text-[12px] text-gray-400 leading-relaxed min-h-[32px]">
          {meta.description}
        </div>

        {!isEditing ? (
          <>
            <div className="flex items-end gap-1.5">
              <span
                className="text-[28px] leading-none font-[200] text-gray-800"
                style={{ fontFamily: "'Outfit',sans-serif" }}
              >
                {setting.valueDays}
              </span>
              <span className="text-[13px] text-gray-400 mb-0.5">days</span>
            </div>

            <div className="flex justify-between text-[11.5px] py-1 border-t border-gray-100">
              <span className="text-gray-400">Updated by</span>
              <span className="text-gray-700">{setting.updatedBy || "—"}</span>
            </div>
            <div className="flex justify-between text-[11.5px]">
              <span className="text-gray-400">Updated at</span>
              <span className="font-mono text-gray-700">
                {formatDateTime(setting.updatedAt)}
              </span>
            </div>

            <ActionButton
              action="edit"
              onClick={startEdit}
              label="Edit"
              className="w-full justify-center mt-1"
            />
          </>
        ) : (
          <>
            <UiInput
              label="Retention (days)"
              type="number"
              minValue={1}
              value={formValue}
              onChange={(e) => setFormValue(e.target.value)}
            />

            {meta.supportsRetroactive ? (
              <label className="flex items-start gap-2 text-[12px] text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-blue-600 mt-0.5 flex-shrink-0"
                  checked={applyRetroactively}
                  onChange={(e) => setApplyRetroactively(e.target.checked)}
                />
                <span>
                  Apply retroactively — also rewrite the expiry on existing
                  records to this new window.
                </span>
              </label>
            ) : (
              <div className="text-[11px] text-purple-700 bg-purple-50 border border-purple-100 rounded-lg px-2.5 py-2">
                This TTL is applied live to the database index — it affects
                already-stored records too, immediately on save.
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <ActionButton
                action="export"
                onClick={onCancel}
                label="Cancel"
                icon={null}
                className="flex-1 justify-center"
              />
              <ActionButton
                action="save"
                onClick={submit}
                label={isSaving ? "Saving..." : "Save"}
                className="flex-1 justify-center"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── SKELETON CARD ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
      <div className="px-4 py-3.5 border-b border-gray-200 bg-gray-50 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-[9px] bg-gray-200 flex-shrink-0" />
        <div className="flex-1">
          <div className="h-3 w-32 bg-gray-200 rounded mb-1.5" />
          <div className="h-2 w-24 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="px-4 py-4 flex flex-col gap-3">
        <div className="h-2.5 w-full bg-gray-100 rounded" />
        <div className="h-2.5 w-2/3 bg-gray-100 rounded" />
        <div className="h-7 w-16 bg-gray-200 rounded mt-1" />
        <div className="h-8 w-full bg-gray-100 rounded mt-2" />
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function RetentionRules() {
  const { data: settingsData, isLoading } = useRetentionSettingsQuery();
  const updateMutation = useUpdateRetentionSettingMutation();
  const [editingKey, setEditingKey] = useState(null);

  const settings = [...(settingsData || [])].sort(
    (a, b) => (SETTINGS_META[a.key]?.order ?? 99) - (SETTINGS_META[b.key]?.order ?? 99),
  );

  const totalPolicies = settings.length;
  const avgRetention = totalPolicies
    ? Math.round(
        settings.reduce((sum, s) => sum + (s.valueDays || 0), 0) /
          totalPolicies,
      )
    : 0;
  const lastUpdated = settings.reduce((latest, s) => {
    if (!s.updatedAt) return latest;
    return !latest || new Date(s.updatedAt) > new Date(latest)
      ? s.updatedAt
      : latest;
  }, null);

  const handleSave = (key, payload) => {
    updateMutation.mutate(
      { key, payload },
      {
        onSuccess: () => {
          toast.success(`${SETTINGS_META[key]?.label || key} updated`);
          setEditingKey(null);
        },
        onError: (error) => {
          toast.error(
            error?.response?.data?.message ||
              "Failed to update retention setting",
          );
        },
      },
    );
  };

  return (
    <div className="container-page">
      <PageHeader
        icon={<ClockIcon width={22} height={22} stroke="#2563eb" strokeWidth={1.8} />}
        title="Retention Rules"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Retention Rules" },
        ]}
      />

      <Section>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-3.5">
          <StatCard
            icon={<Layers stroke="#2563eb" />}
            iconColor="text-blue-500"
            count={isLoading ? "—" : totalPolicies}
            countColor="text-blue-600"
            title="Policies Configured"
          />
          <StatCard
            icon={<ClockIcon width={20} height={20} stroke="#16a34a" />}
            iconColor="text-emerald-500"
            count={isLoading ? "—" : `${avgRetention}d`}
            countColor="text-emerald-600"
            title="Avg. Retention"
          />
          <StatCard
            icon={<History stroke="#7c3aed" />}
            iconColor="text-purple-500"
            count={isLoading ? "—" : formatDateTime(lastUpdated).split(" ")[0]}
            countColor="text-purple-700"
            title="Last Updated"
          />
        </div>
      </Section>

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            settings.map((setting) => (
              <SettingCard
                key={setting.key}
                setting={setting}
                isEditing={editingKey === setting.key}
                isSaving={
                  updateMutation.isPending &&
                  updateMutation.variables?.key === setting.key
                }
                onEdit={setEditingKey}
                onCancel={() => setEditingKey(null)}
                onSave={handleSave}
              />
            ))
          )}
        </div>
      </Section>
    </div>
  );
}
