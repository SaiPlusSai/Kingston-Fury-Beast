/**
 * prediction.routes.js
 * ====================
 * REST endpoints serving ML prediction reports and forecasts (BUILD-11).
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const PREDICTION_OUTPUT_DIR = (() => {
  const packaged = path.resolve(__dirname, '../../data/predictions');
  if (fs.existsSync(packaged)) return packaged;
  return path.resolve(__dirname, '../../../prediction-service/output');
})();

const ZONES_CONFIG_PATH = (() => {
  const packaged = path.resolve(__dirname, '../../data/predictions/zones.json');
  if (fs.existsSync(packaged)) return packaged;
  return path.resolve(__dirname, '../../../prediction-service/config/zones.json');
})();

/**
 * GET /api/predictions/summary
 * Returns global model comparison metrics (Prophet vs ARIMA vs Baselines).
 */
router.get('/summary', (req, res) => {
  try {
    const files = fs.readdirSync(PREDICTION_OUTPUT_DIR)
      .filter(f => f.startsWith('evaluation_report_') && f.endsWith('.json'))
      .sort()
      .reverse();

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No prediction evaluation reports found.',
      });
    }

    const latestReport = JSON.parse(
      fs.readFileSync(path.join(PREDICTION_OUTPUT_DIR, files[0]), 'utf8')
    );

    return res.json({
      success: true,
      reportFile: files[0],
      data: latestReport,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve prediction summary.',
      error: error.message,
    });
  }
});

/**
 * GET /api/predictions/zones
 * Returns all macrodistrito zones and their risk levels.
 */
router.get('/zones', (req, res) => {
  try {
    if (!fs.existsSync(ZONES_CONFIG_PATH)) {
      return res.status(404).json({
        success: false,
        message: 'Zones configuration file not found.',
      });
    }

    const zonesData = JSON.parse(fs.readFileSync(ZONES_CONFIG_PATH, 'utf8'));
    return res.json({
      success: true,
      zones: zonesData.zones || zonesData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve zones.',
      error: error.message,
    });
  }
});

/**
 * GET /api/predictions/:zoneId
 * Returns historical evaluation and forecast for a specific macrodistrito zone.
 */
router.get('/:zoneId', (req, res) => {
  const { zoneId } = req.params;

  try {
    const files = fs.readdirSync(PREDICTION_OUTPUT_DIR)
      .filter(f => f.startsWith('evaluation_report_') && f.endsWith('.json'))
      .sort()
      .reverse();

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No evaluation reports found.',
      });
    }

    const latestReport = JSON.parse(
      fs.readFileSync(path.join(PREDICTION_OUTPUT_DIR, files[0]), 'utf8')
    );

    const zoneData = latestReport.zones ? latestReport.zones[zoneId] : null;

    if (!zoneData) {
      // Fallback matching case-insensitively
      const matchedKey = Object.keys(latestReport.zones || {}).find(
        k => k.toLowerCase() === zoneId.toLowerCase()
      );
      if (matchedKey) {
        return res.json({
          success: true,
          zoneId: matchedKey,
          data: latestReport.zones[matchedKey],
        });
      }

      return res.status(404).json({
        success: false,
        message: `Zone '${zoneId}' not found in latest prediction report.`,
      });
    }

    return res.json({
      success: true,
      zoneId,
      data: zoneData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve zone prediction.',
      error: error.message,
    });
  }
});

module.exports = router;
