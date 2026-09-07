import api from './api';

export const getDashboard = async () => {
  const { data } = await api.get('/admin/dashboard');
  return data.data;
};

export const getMonitoring = async () => {
  const { data } = await api.get('/admin/monitoring');
  return data.data;
};

export const getActivityFeed = async (limit = 20) => {
  const { data } = await api.get('/admin/activity', { params: { limit } });
  return data.data;
};
