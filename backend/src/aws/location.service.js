const {
  SearchPlaceIndexForTextCommand,
  SearchPlaceIndexForPositionCommand,
  GetMapTileCommand,
} = require('@aws-sdk/client-location');
const { getLocationClient } = require('./clients');
const { awsInfrastructure } = require('../config/aws');
const logger = require('../utils/logger');

/**
 * Integración con Amazon Location Service.
 */
class LocationService {
  constructor() {
    this.client = getLocationClient();
    this.placeIndex = awsInfrastructure.location.placeIndex;
    this.mapName = awsInfrastructure.location.mapName;
  }

  async searchPlaces(text, maxResults = 5) {
    if (!this.placeIndex) {
      logger.debug('Location place index not configured');
      return [];
    }

    try {
      const result = await this.client.send(
        new SearchPlaceIndexForTextCommand({
          IndexName: this.placeIndex,
          Text: text,
          MaxResults: maxResults,
        }),
      );
      return (result.Results || []).map((item) => ({
        label: item.Place?.Label,
        latitude: item.Place?.Geometry?.Point?.[1],
        longitude: item.Place?.Geometry?.Point?.[0],
        city: item.Place?.Municipality || item.Place?.City || item.Place?.Region,
      }));
    } catch (error) {
      logger.error('Location search failed', { error: error.message });
      return [];
    }
  }

  async reverseGeocode(latitude, longitude) {
    if (!this.placeIndex) {
      logger.debug('Location place index not configured');
      return null;
    }

    try {
      const result = await this.client.send(
        new SearchPlaceIndexForPositionCommand({
          IndexName: this.placeIndex,
          Position: [Number(longitude), Number(latitude)],
          MaxResults: 1,
        }),
      );

      const place = result.Results?.[0]?.Place || null;
      if (!place) return null;

      return {
        label: place.Label || null,
        country: place.Country || null,
        region: place.Region || null,
        municipality: place.Municipality || null,
        city: place.Municipality || place.City || place.Region || null,
      };
    } catch (error) {
      logger.warn('Location reverse geocode failed', { error: error.message });
      return null;
    }
  }

  async getMapTile(z, x, y) {
    if (!this.mapName) {
      logger.debug('Location map name not configured');
      return null;
    }

    try {
      const result = await this.client.send(
        new GetMapTileCommand({
          MapName: this.mapName,
          Z: parseInt(z, 10),
          X: parseInt(x, 10),
          Y: parseInt(y, 10),
        }),
      );

      // Result may contain Body or Blob depending on SDK; normalize to Buffer.
      const body = result.Blob || result.Body || result.BodyReadableStream || null;
      let buffer = null;
      if (body == null) buffer = null;
      else if (Buffer.isBuffer(body)) buffer = body;
      else if (body instanceof Uint8Array) buffer = Buffer.from(body);
      else if (typeof body === 'string') buffer = Buffer.from(body, 'base64');
      else if (body && typeof body.arrayBuffer === 'function') {
        // For streams with arrayBuffer().
        const arr = await body.arrayBuffer();
        buffer = Buffer.from(arr);
      }

      return {
        contentType: result.ContentType || 'image/png',
        data: buffer,
      };
    } catch (error) {
      logger.error('GetMapTile failed', { error: error.message });
      return null;
    }
  }
}

module.exports = new LocationService();
