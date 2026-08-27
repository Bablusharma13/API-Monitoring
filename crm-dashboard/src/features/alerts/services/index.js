import axios from "axios";

const BASE = import.meta.env.VITE_CRM_BACKEND;

// ── Alert Rules ────────────────────────────────────────────────────────────
export const AlertRulesService = {
  fetchAll: async (params) => {
    const { data } = await axios.get(`${BASE}/api/v1/alert-rules`, {
      params,
    });
    return data.data;
  },
  fetchById: async (id) => {
    const { data } = await axios.get(`${BASE}/api/v1/alert-rules/${id}`);
    return data.data;
  },
  create: async (payload) => {
    const { data } = await axios.post(`${BASE}/api/v1/alert-rules`, payload);
    return data.data;
  },
  update: async (id, payload) => {
    const { data } = await axios.put(
      `${BASE}/api/v1/alert-rules/${id}`,
      payload,
    );
    return data.data;
  },
  remove: async (id) => {
    const { data } = await axios.delete(`${BASE}/api/v1/alert-rules/${id}`);
    return data.data;
  },
};

// ── Notification Channels ───────────────────────────────────────────────────
export const NotificationChannelsService = {
  fetchAll: async (params) => {
    const { data } = await axios.get(
      `${BASE}/api/v1/notification-channels`,
      { params },
    );
    return data.data;
  },
  fetchById: async (id) => {
    const { data } = await axios.get(
      `${BASE}/api/v1/notification-channels/${id}`,
    );
    return data.data;
  },
  create: async (payload) => {
    const { data } = await axios.post(
      `${BASE}/api/v1/notification-channels`,
      payload,
    );
    return data.data;
  },
  update: async (id, payload) => {
    const { data } = await axios.put(
      `${BASE}/api/v1/notification-channels/${id}`,
      payload,
    );
    return data.data;
  },
  remove: async (id) => {
    const { data } = await axios.delete(
      `${BASE}/api/v1/notification-channels/${id}`,
    );
    return data.data;
  },
  test: async (id) => {
    const { data } = await axios.post(
      `${BASE}/api/v1/notification-channels/${id}/test`,
    );
    return data.data;
  },
};

// ── Alerts ───────────────────────────────────────────────────────────────
export const AlertsService = {
  fetchAll: async (params) => {
    const { data } = await axios.get(`${BASE}/api/v1/alerts`, { params });
    return data.data;
  },
  fetchSummary: async () => {
    const { data } = await axios.get(`${BASE}/api/v1/alerts/summary`);
    return data.data;
  },
  ack: async (id) => {
    const { data } = await axios.patch(`${BASE}/api/v1/alerts/${id}/ack`);
    return data.data;
  },
  resolve: async (id) => {
    const { data } = await axios.patch(
      `${BASE}/api/v1/alerts/${id}/resolve`,
    );
    return data.data;
  },
};

// ── Reference data (read-only, for the rule/silence scope pickers) ────────
export const ReferenceDataService = {
  fetchCategories: async () => {
    const { data } = await axios.get(`${BASE}/api/v1/categories`, {
      params: { limit: 200 },
    });
    return data.data?.data ?? data.data ?? [];
  },
  fetchApis: async () => {
    const { data } = await axios.get(`${BASE}/api/v1/apis`, {
      params: { limit: 200 },
    });
    return data.data?.data ?? data.data ?? [];
  },
};

// ── Silences ─────────────────────────────────────────────────────────────
export const SilencesService = {
  fetchAll: async (params) => {
    const { data } = await axios.get(`${BASE}/api/v1/silences`, { params });
    return data.data;
  },
  create: async (payload) => {
    const { data } = await axios.post(`${BASE}/api/v1/silences`, payload);
    return data.data;
  },
  remove: async (id) => {
    const { data } = await axios.delete(`${BASE}/api/v1/silences/${id}`);
    return data.data;
  },
};
