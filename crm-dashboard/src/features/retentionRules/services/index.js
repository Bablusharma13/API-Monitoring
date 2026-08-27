import axios from "axios";

const BASE = import.meta.env.VITE_CRM_BACKEND;

export const RetentionService = {
  // GET /api/v1/retention-settings
  // -> [{ key, valueDays, updatedBy, updatedAt }] for check_retention_days,
  //    ping_retention_days, tenant_metric_retention_days
  fetchRetentionSettings: async () => {
    const { data } = await axios.get(`${BASE}/api/v1/retention-settings`);
    return data.data;
  },

  // PUT /api/v1/retention-settings/:key { valueDays, applyRetroactively }
  updateRetentionSetting: async (key, payload) => {
    const { data } = await axios.put(
      `${BASE}/api/v1/retention-settings/${key}`,
      payload,
    );
    return data.data;
  },
};
