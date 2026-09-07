const locationService = require('../services/location.service');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const searchPlaces = asyncHandler(async (req, res) => {
  const places = await locationService.searchPlaces(req.query.q);
  sendSuccess(res, { message: 'Places retrieved', data: places });
});

const getMapTile = asyncHandler(async (req, res) => {
  const { z, x, y } = req.params;
  const result = await locationService.getMapTile(z, x, y);
  if (!result || !result.data) {
    return res.status(404).send('Tile not found');
  }
  res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Content-Type', result.contentType || 'image/png');
  res.send(result.data);
});

const getMapMarkers = asyncHandler(async (req, res) => {
  const markers = await locationService.getMapMarkers(req.query);
  sendSuccess(res, { message: 'Map markers retrieved', data: markers });
});

const radiusSearch = asyncHandler(async (req, res) => {
  const results = await locationService.radiusSearch({
    latitude: req.query.latitude,
    longitude: req.query.longitude,
    radiusKm: req.query.radiusKm,
    filters: req.query,
  });
  sendSuccess(res, { message: 'Radius search completed', data: results });
});

const getHeatmap = asyncHandler(async (req, res) => {
  const heatmap = await locationService.getHeatmapData();
  sendSuccess(res, { message: 'Heatmap data retrieved', data: heatmap });
});

module.exports = {
  searchPlaces,
  getMapMarkers,
  radiusSearch,
  getHeatmap,
  getMapTile,
};
