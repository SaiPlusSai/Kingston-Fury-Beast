const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees) => (degrees * Math.PI) / 180;

/**
 * Fórmula de Haversine para distancia entre dos coordenadas (km).
 */
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

const isValidCoordinate = (latitude, longitude) => {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

const filterByRadius = (items, centerLat, centerLng, radiusKm, latKey = 'latitude', lngKey = 'longitude') => {
  return items
    .filter((item) => isValidCoordinate(item[latKey], item[lngKey]))
    .map((item) => ({
      ...item,
      distanceKm: calculateDistanceKm(centerLat, centerLng, item[latKey], item[lngKey]),
    }))
    .filter((item) => item.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
};

module.exports = {
  calculateDistanceKm,
  isValidCoordinate,
  filterByRadius,
  EARTH_RADIUS_KM,
};
