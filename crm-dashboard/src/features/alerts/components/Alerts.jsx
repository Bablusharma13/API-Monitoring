import { useState } from "react";
import PageHeader from "../../../components/ui/PageHeader";
import { Section } from "../../../components/ui/Section";
import { BellIcon } from "../../../components/ui/AppIcons";
import { useGetAlertsSummaryQuery } from "../hooks/query/useGetAlertsSummaryQuery";
import { ActiveAlertsPanel } from "./ActiveAlertsPanel";
import { AlertRulesPanel } from "./AlertRulesPanel";
import { NotificationChannelsPanel } from "./NotificationChannelsPanel";
import { AlertHistoryPanel } from "./AlertHistoryPanel";
import { SilencesPanel } from "./SilencesPanel";

const PulseRing = () => (
  <span className="relative inline-flex w-2.5 h-2.5 shrink-0 items-center justify-center">
    <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60 animate-ping" />
    <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-red-500" />
  </span>
);

const TABS = [
  { id: "active", label: "Active Alerts" },
  { id: "rules", label: "Alert Rules" },
  { id: "channels", label: "Channels" },
  { id: "history", label: "History" },
  { id: "silences", label: "Silences" },
];

export const Alerts = () => {
  const [activeTab, setActiveTab] = useState("active");
  const { data: summary } = useGetAlertsSummaryQuery({
    refetchInterval: 20000,
  });

  return (
    <div className="container-page">
      <PageHeader
        icon={<BellIcon width={22} height={22} stroke="#2563eb" strokeWidth={1.8} />}
        iconGradient=""
        title="Alerts"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Alerts" },
        ]}
      />

      <Section>
        <div className="flex border-b-2 border-gray-200 mb-1">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] border-b-2 -mb-0.5 transition-all whitespace-nowrap cursor-pointer
                ${activeTab === id ? "text-blue-600 border-blue-600" : "text-gray-400 border-transparent hover:text-gray-700"}`}
            >
              {id === "active" && summary?.firing > 0 && <PulseRing />}
              {label}
              {id === "active" && summary?.firing > 0 && (
                <span
                  className={`text-[10.5px] font-mono px-1.5 py-0.5 rounded-full ${activeTab === id ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-400"}`}
                >
                  {summary.firing}
                </span>
              )}
            </button>
          ))}
        </div>
      </Section>

      <Section>
        {activeTab === "active" && <ActiveAlertsPanel />}
        {activeTab === "rules" && <AlertRulesPanel />}
        {activeTab === "channels" && <NotificationChannelsPanel />}
        {activeTab === "history" && <AlertHistoryPanel />}
        {activeTab === "silences" && <SilencesPanel />}
      </Section>
    </div>
  );
};

export default Alerts;
