import PageHeader from "../../../components/ui/PageHeader";
import { Section } from "../../../components/ui/Section";
import { BellIcon } from "../../../components/ui/AppIcons";
import { ActiveAlertsPanel } from "./ActiveAlertsPanel";

export const ActiveAlerts = () => {
  return (
    <div className="container-page">
      <PageHeader
        icon={<BellIcon width={22} height={22} stroke="#dc2626" strokeWidth={1.8} />}
        iconGradient=""
        title="Active Alerts"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Alerts", href: "/dashboard/alerts" },
          { label: "Active Alerts" },
        ]}
      />

      <Section>
        <ActiveAlertsPanel />
      </Section>
    </div>
  );
};

export default ActiveAlerts;
