const express = require('express');
const locationController = require('../controllers/location.controller');
const validate = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const {
  searchPlacesSchema,
  radiusSearchSchema,
  mapMarkersQuerySchema,
} = require('../validators/location.validator');

const router = express.Router();

// Serve map tiles without authentication so the map library can fetch them directly
router.get('/tiles/:z/:x/:y', locationController.getMapTile);

router.use(authenticate);

router.get('/search', validate(searchPlacesSchema, 'query'), locationController.searchPlaces);
router.get('/markers', validate(mapMarkersQuerySchema, 'query'), locationController.getMapMarkers);
router.get('/radius', validate(radiusSearchSchema, 'query'), locationController.radiusSearch);
router.get('/heatmap', locationController.getHeatmap);

module.exports = router;
