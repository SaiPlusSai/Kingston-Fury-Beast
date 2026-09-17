import api from './api';

export const createSupportMessage = async (payload) => {
  const { data } = await api.post('/support', payload);
  return data.data;
};

export const getMySupportMessages = async () => {
  const { data } = await api.get('/support/mine');
  return data.data;
};

export const getSupportInbox = async () => {
  const { data } = await api.get('/support/inbox');
  return data.data;
};

export const replySupportMessage = async (id, response) => {
  const { data } = await api.post(`/support/${id}/reply`, { response });
  return data.data;
};

export const closeSupportMessage = async (id) => {
  const { data } = await api.patch(`/support/${id}/close`);
  return data.data;
};
