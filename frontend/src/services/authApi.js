import api from './api';

export const login = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  return data.data;
};

export const register = async (payload) => {
  const { data } = await api.post('/auth/register', payload);
  return data.data;
};

export const logout = async (refreshToken) => {
  const { data } = await api.post('/auth/logout', { refreshToken });
  return data.data;
};

export const getProfile = async () => {
  const { data } = await api.get('/auth/me');
  return data.data;
};

export const updateProfile = async (profileData) => {
  const { data } = await api.put('/auth/me', profileData);
  return data.data;
};

export const updatePassword = async (passwordData) => {
  const { data } = await api.put('/auth/password', passwordData);
  return data.data;
};

export const forgotPassword = async (email) => {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
};

export const resetPassword = async (payload) => {
  const { data } = await api.post('/auth/reset-password', payload);
  return data.data;
};
