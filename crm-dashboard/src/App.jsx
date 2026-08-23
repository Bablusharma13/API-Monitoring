import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { Apis } from "./features/apis/components/Dashboard";
import { ApplicationLayout } from "./components/layout/ApplicationLayout";
import PrivateRoute from "./components/layout/PrivateLayout";
import { Incidents } from "./features/incidents/components/Incidents";
import LogExplorer from "./pages/LogExplorer";
import LogDetail from "./pages/LogDetailTrace";
import Alerts from "./pages/Alerts";
import ArchiveBrowser from "./pages/ArchiveBrowser";
import BufferDashboard from "./pages/BufferDashboard";
import PipelineMonitor from "./pages/PipelineMonitor";
import RetentionRules from "./pages/RetentionRules";
import StorageTiers from "./pages/StorageTiers";
import NotificationChannel from "./pages/NotificationChannel";
import AlertRules from "./pages/AlertRules";
import QuotaLimits from "./pages/QuotaLimits";
import Saturation from "./pages/Saturation";
import Traffic from "./pages/Traffic";
import Errors from "./pages/ErrorsPage";
import UserDetail from "./pages/UserDetail";
import RequestLog from "./pages/RequestLog";
import ActiveAlerts from "./pages/ActiveAlerts";
import SLODashboard from "./pages/SloDashboard";
import GlobalDashboard from "./pages/GlobalDashboard";
import Latency from "./pages/Latency";
import UserActivity from "./pages/UserActivity";
import TenantDetail from "./pages/TenantDetail";
import EndpointDetail from "./pages/EndpointDetail";
import EndpointExplorer from "./pages/EndpointExplorer";
import TenantOverview from "./pages/TenantOverview";
import TraceDetail from "./pages/TraceDetail";
import Login from "./pages/Login";

import { Categories } from "./features/categories/components/categories";
import { Checks } from "./features/checks/components/Checks";
import ApiFormLayout from "./features/apiForm/components/ApiFormLayout";
import { ApiDetails } from "./features/apiDetails/components/ApiDetails";

import { Logout } from "./features/auth/Logout";
import ApiDashboard from "./features/apiDashboard/components/ApiDashboard";
import ApiLeaderboard from "./features/apiLeaderboard/components/ApiLeaderboard";
import CronHeartbeatMonitor from "./features/cronHeartbeat/components/cronHeartBeat";
import CronInventory from "./features/cronInventory/components/cronInventory";
import JobHistory from "./features/cronJobHistory/components/JobHistory";
import CronDetail from "./features/cronHeartbeat/components/CronDetails";
import { ThemeAwareToaster } from "./components/ui/ThemeAwareToaster.jsx";

function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeAwareToaster />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route element={<ApplicationLayout />}>
              {/* NOTE: APIs */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard/apis" element={<Apis />} />
              <Route path="/dashboard/incidents" element={<Incidents />} />
              <Route path="/dashboard/categories" element={<Categories />} />
              <Route path="/dashboard/checks" element={<Checks />} />
              <Route path="/dashboard/" element={<ApiDashboard />} />
              <Route
                path="/dashboard/apis/form/:api"
                element={<ApiFormLayout />}
              />
              <Route path="/dashboard/apis/:api" element={<ApiDetails />} />
              <Route
                path="/dashboard/apis/leaderboard"
                element={<ApiLeaderboard />}
              />

              {/* cron apis */}
              <Route
                path="/dashboard/cron-monitor"
                element={<CronHeartbeatMonitor />}
              />
              <Route
                path="/dashboard/cron-monitor/:id"
                element={<CronDetail />}
              />
              <Route path="/cron-inventory" element={<CronInventory />} />
              <Route path="/cron-job" element={<JobHistory />} />

              {/* NOTE: Logs And Tenant Monitoring */}
              {/* NOTE:  Tenants */}
              <Route path="/dashboard/tenant" element={<GlobalDashboard />} />
              <Route path="/dashboard/tenants" element={<TenantOverview />} />
              <Route path="/dashboard/tenants/:id" element={<TenantDetail />} />
              <Route
                path="/dashboard/tenants/:tenantId/employees/:employeeId"
                element={<UserDetail />}
              />
              <Route
                path="/dashboard/endpoint-explorer"
                element={<EndpointExplorer />}
              />
              <Route
                path="/dashboard/endpoint-explorer/endpoint-detail"
                element={<EndpointDetail />}
              />
              <Route path="/dashboard/request-log" element={<RequestLog />} />
              <Route path="/dashboard/latency" element={<Latency />} />

              {/* NOTE: Logs  */}
              <Route path="/log-explorer" element={<LogExplorer />} />
              <Route path="/log-detail-trace" element={<LogDetail />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/archive-browser" element={<ArchiveBrowser />} />
              <Route path="/buffer-dashboard" element={<BufferDashboard />} />
              <Route path="/pipeline-monitor" element={<PipelineMonitor />} />
              <Route path="/retention-rules" element={<RetentionRules />} />
              <Route path="/storage-tiers" element={<StorageTiers />} />

              <Route
                path="/notification-channels"
                element={<NotificationChannel />}
              />
              <Route path="/alert-rules" element={<AlertRules />} />
              <Route path="/Quota-limits" element={<QuotaLimits />} />
              <Route path="/saturation" element={<Saturation />} />
              <Route path="/traffic" element={<Traffic />} />
              <Route path="/errors" element={<Errors />} />
              <Route path="/active-alerts" element={<ActiveAlerts />} />
              <Route path="/slo-dashboard" element={<SLODashboard />} />
              <Route path="/user-activity" element={<UserActivity />} />
              <Route path="/trace-detail" element={<TraceDetail />} />
            </Route>
            <Route path="/logout" element={<Logout />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
