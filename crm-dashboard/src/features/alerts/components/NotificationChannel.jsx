import PageHeader from "../../../components/ui/PageHeader";
import { Section } from "../../../components/ui/Section";
import { NotificationChannelsPanel } from "./NotificationChannelsPanel";

const ChannelIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2563eb"
    strokeWidth="1.8"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

export const NotificationChannel = () => {
  return (
    <div className="container-page">
      <PageHeader
        icon={<ChannelIcon />}
        iconGradient=""
        title="Notification Channels"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Alerts", href: "/dashboard/alerts" },
          { label: "Notification Channels" },
        ]}
      />

      <Section>
        <NotificationChannelsPanel />
      </Section>
    </div>
  );
};

export default NotificationChannel;
