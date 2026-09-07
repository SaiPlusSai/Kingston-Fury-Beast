import api from './api';

export const searchPlaces = async (q) => {
  const { data } = await api.get('/location/search', { params: { q } });
  return data.data;
};

export const getMapMarkers = async (params = {}) => {
  const { data } = await api.get('/location/markers', { params });
  return data.data;
};

export const radiusSearch = async (params) => {
  const { data } = await api.get('/location/radius', { params });
  return data.data;
};

export const getHeatmap = async () => {
  const { data } = await api.get('/location/heatmap');
  return data.data;
};
