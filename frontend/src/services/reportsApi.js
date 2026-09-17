import api from './api';

export const createReport = async (payload) => {
  const { data } = await api.post('/reports', payload);
  return data.data;
};

export const listReports = async (params = {}) => {
  const { data } = await api.get('/reports', { params });
  return data.data;
};

export const getReport = async (id) => {
  const { data } = await api.get(`/reports/${id}`);
  return data.data;
};

export const getPublicReport = async (id) => {
  const { data } = await api.get(`/reports/${id}/public`);
  return data.data;
};

export const updateReportStatus = async (id, status, notes) => {
  const { data } = await api.patch(`/reports/${id}/status`, { status, notes });
  return data.data;
};

export const resolveReport = async (id) => {
  const { data } = await api.post(`/reports/${id}/resolve`);
  return data.data;
};

export const voteReport = async (id, voteType) => {
  const { data } = await api.post(`/reports/${id}/vote`, { voteType });
  return data.data;
};

export const deleteReport = async (id) => {
  const { data } = await api.delete(`/reports/${id}`);
  return data.data;
};

export const getNearbyReports = async (params) => {
  const { data } = await api.get('/reports/nearby', { params });
  return data.data;
};

export const getReportAnalytics = async () => {
  const { data } = await api.get('/reports/analytics');
  return data.data;
};
