import axios from "axios";

const BASE = import.meta.env.VITE_CRM_BACKEND;

export const TenantService = {
  fetchTenantsSummary: async () => {
    const { data } = await axios.get(`${BASE}/api/v1/tenants/summary`);
    return data.data;
  },

  fetchFleetSummary: async () => {
    const { data } = await axios.get(`${BASE}/api/v1/tenants/fleet-summary`);
    return data.data;
  },

  fetchTenantCards: async (params = {}) => {
    const { data } = await axios.get(`${BASE}/api/v1/tenants/cards`, {
      params,
    });
    return data.data;
  },

  fetchTenantDetails: async (tenantId) => {
    const { data } = await axios.get(`${BASE}/api/v1/tenants/${tenantId}`);
    return data.data;
  },
  fetchTenantEmployees: async (
    tenantId,
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  ) => {
    const params = { page, limit };
    if (search) params.search = search;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    const { data } = await axios.get(
      `${BASE}/api/v1/tenants/${tenantId}/employees`,
      { params },
    );
    return data.data;
  },
  fetchTenantEndpointMatrics: async (
    tenantId,
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  ) => {
    const params = { page, limit };
    if (search) params.search = search;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    const { data } = await axios.get(
      `${BASE}/api/v1/tenants/${tenantId}/endpoint-matrics`,
      { params },
    );
    return data.data;
  },
  fetchRequestLog: async (page, limit, search, sortBy, sortOrder) => {
    const params = { page, limit };
    if (search) params.search = search;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    const { data } = await axios.get(`${BASE}/api/v1/tenants/request-log`, {
      params,
    });
    return data.data;
  },
  fetchTenantRequestLog: async (
    tenantId,
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  ) => {
    const params = { page, limit };
    if (search) params.search = search;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    const { data } = await axios.get(
      `${BASE}/api/v1/tenants/${tenantId}/request-log`,
      { params },
    );
    return data.data;
  },
  fetchTenantEmployeeDetails: async (tenantId, eId) => {
    const { data } = await axios.get(
      `${BASE}/api/v1/tenants/${tenantId}/employee/${eId}`,
    );
    return data.data;
  },
  fetchTenantEmployeeMatrics: async (
    tenantId,
    eId,
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  ) => {
    const params = { page, limit };
    if (search) params.search = search;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    const { data } = await axios.get(
      `${BASE}/api/v1/tenants/${tenantId}/employee-matrics/${eId}`,
      { params },
    );
    return data.data;
  },
  fetchEndpointExplorer: async (page, limit, search, sortBy, sortOrder) => {
    const params = { page, limit };
    if (search) params.search = search;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    const { data } = await axios.get(
      `${BASE}/api/v1/tenants/endpoint-explorer`,
      { params },
    );
    return data.data;
  },
  fetchEndpointTenants: async (
    endpoint,
    method,
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  ) => {
    const params = { page, limit };
    if (search) params.search = search;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    const { data } = await axios.get(
      `${BASE}/api/v1/tenants/endpoint-explorer/${encodeURIComponent(endpoint)}/${method}`,
      { params },
    );
    return data.data;
  },
  fetchEndpointSummary: async (endpoint, method) => {
    const { data } = await axios.get(
      `${BASE}/api/v1/tenants/endpoint-explorer/${encodeURIComponent(endpoint)}/${method}/summary`,
    );
    return data.data[0];
  },
  fetchTenantDashboardSummary: async (
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  ) => {
    const params = { page, limit };
    if (search) params.search = search;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    const { data } = await axios.get(`${BASE}/api/v1/tenants/dashboard`, {
      params,
    });
    return data.data;
  },

  createTenant: async (payload) => {
    const { data } = await axios.post(
      `https://backend-auth.enopsy.xyz/api/tenant/create`,
      payload,
    );
    return data;
  },

  updateTenant: async (tenantId, payload) => {
    const { data } = await axios.patch(
      `${BASE}/api/v1/tenants/${tenantId}/origin`,
      payload,
    );
    return data.data;
  },
};
