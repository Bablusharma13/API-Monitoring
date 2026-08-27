import PageHeader from "../../../components/ui/PageHeader";
import { Section } from "../../../components/ui/Section";
import { AlertRulesPanel } from "./AlertRulesPanel";

const RuleIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2563eb"
    strokeWidth="1.8"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M20 12h2M2 12h2M17.66 17.66l1.41 1.41M4.93 4.93l1.41 1.41" />
  </svg>
);

export const AlertRules = () => {
  return (
    <div className="container-page">
      <PageHeader
        icon={<RuleIcon />}
        iconGradient=""
        title="Alert Rules"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Alerts", href: "/dashboard/alerts" },
          { label: "Alert Rules" },
        ]}
      />

      <Section>
        <AlertRulesPanel />
      </Section>
    </div>
  );
};

export default AlertRules;
