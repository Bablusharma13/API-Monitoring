import axios from "axios";

const BASE = import.meta.env.VITE_CRM_BACKEND;

// ── Synthetic Transactions ──────────────────────────────────────────────────
export const TransactionsService = {
  fetchAll: async (params) => {
    const { data } = await axios.get(`${BASE}/api/v1/transactions`, {
      params,
    });
    return data.data;
  },
  fetchById: async (id) => {
    const { data } = await axios.get(`${BASE}/api/v1/transactions/${id}`);
    return data.data;
  },
  create: async (payload) => {
    const { data } = await axios.post(`${BASE}/api/v1/transactions`, payload);
    return data.data;
  },
  update: async (id, payload) => {
    const { data } = await axios.put(
      `${BASE}/api/v1/transactions/${id}`,
      payload,
    );
    return data.data;
  },
  remove: async (id) => {
    const { data } = await axios.delete(`${BASE}/api/v1/transactions/${id}`);
    return data.data;
  },
  runNow: async (id) => {
    const { data } = await axios.post(
      `${BASE}/api/v1/transactions/${id}/run`,
    );
    return data.data;
  },
  fetchRuns: async (id, params) => {
    const { data } = await axios.get(
      `${BASE}/api/v1/transactions/${id}/runs`,
      { params },
    );
    return data.data;
  },
};

// ── Notification channel options ────────────────────────────────────────────
// Deliberately duplicated here rather than imported from src/features/alerts
// (that feature is owned by a sibling agent in this same build wave) — same
// duplication convention followed by the other features built alongside this
// one. Only the read used by the "Notify via" multi-select lives here.
export const NotificationChannelsOptionsService = {
  fetchAll: async (params) => {
    const { data } = await axios.get(
      `${BASE}/api/v1/notification-channels`,
      { params },
    );
    return data.data;
  },
};
