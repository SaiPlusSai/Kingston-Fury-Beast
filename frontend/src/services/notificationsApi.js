import api from './api';

export const listNotifications = async (params = {}) => {
  const { data } = await api.get('/notifications', { params });
  return data.data;
};

export const markNotificationRead = async (id) => {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data.data;
};

export const markAllNotificationsRead = async () => {
  const { data } = await api.patch('/notifications/read-all');
  return data.data;
};
