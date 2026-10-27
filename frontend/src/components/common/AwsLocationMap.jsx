import React, { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const LA_PAZ_DEFAULT_CENTER = [-68.135, -16.498]; // Plaza Murillo / Centro, La Paz

const OSM_RASTER_STYLE = {
  version: 8,
  sources: {
    'osm-tiles': {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  },
  layers: [
    {
      id: 'osm-tiles-layer',
      type: 'raster',
      source: 'osm-tiles',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

const getInitialStyle = () => {
  const region = import.meta.env.VITE_AWS_LOCATION_REGION || 'us-east-1';
  const mapName = import.meta.env.VITE_AWS_LOCATION_MAP_NAME;
  const apiKey = import.meta.env.VITE_AWS_LOCATION_API_KEY;

  if (mapName && apiKey && apiKey !== 'YOUR_AWS_LOCATION_API_KEY' && apiKey.trim() !== '') {
    return `https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${mapName}/style-descriptor?key=${apiKey}`;
  }

  // CARTO Positron: Fast, clean, vector style with clear streets and labels
  return 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
};

const AwsLocationMap = ({
  className = '',
  center = LA_PAZ_DEFAULT_CENTER,
  zoom = 13,
  markers = [],
  onMapReady,
  showNavigation = true,
  showAttribution = true,
  preserveDrawingBuffer = false,
  centerOnUserLocation = true,
  userLocationZoom = 15,
  showUserLocationMarker = true,
  onMapClick,
  onMarkerClick,
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRefs = useRef([]);
  const userLocationMarkerRef = useRef(null);

  const validCenter = useMemo(() => {
    return Array.isArray(center) && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])
      ? center
      : LA_PAZ_DEFAULT_CENTER;
  }, [center]);

  const [resolvedCenter, setResolvedCenter] = useState(validCenter);

  // Intentar geolocalización en segundo plano sin bloquear el renderizado
  useEffect(() => {
    if (typeof window === 'undefined' || !centerOnUserLocation || !navigator.geolocation) return;

    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;
        const userCoords = [position.coords.longitude, position.coords.latitude];
        setResolvedCenter(userCoords);
        if (mapRef.current) {
          mapRef.current.flyTo({ center: userCoords, zoom: userLocationZoom, duration: 1200 });

          if (showUserLocationMarker) {
            if (userLocationMarkerRef.current) {
              userLocationMarkerRef.current.remove();
            }
            const markerElement = document.createElement('div');
            markerElement.style.width = '18px';
            markerElement.style.height = '18px';
            markerElement.style.borderRadius = '999px';
            markerElement.style.border = '3px solid white';
            markerElement.style.boxShadow = '0 0 0 8px rgba(76, 159, 112, 0.25)';
            markerElement.style.background = '#4c9f70';

            userLocationMarkerRef.current = new maplibregl.Marker({ element: markerElement, anchor: 'center' })
              .setLngLat(userCoords)
              .addTo(mapRef.current);
          }
        }
      },
      () => {
        // En caso de denegación o timeout, se mantiene el centro por defecto
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
    );

    return () => {
      cancelled = true;
    };
  }, [centerOnUserLocation, userLocationZoom, showUserLocationMarker]);

  // Inicialización del mapa MapLibre
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current || mapRef.current) return undefined;

    const style = getInitialStyle();
    let mapInstance;

    try {
      mapInstance = new maplibregl.Map({
        container: mapContainerRef.current,
        style,
        center: resolvedCenter,
        zoom: zoom,
        preserveDrawingBuffer,
        attributionControl: showAttribution,
      });
    } catch {
      // Fallback inmediato a raster OSM si falla la inicialización de estilo
      mapInstance = new maplibregl.Map({
        container: mapContainerRef.current,
        style: OSM_RASTER_STYLE,
        center: resolvedCenter,
        zoom: zoom,
        preserveDrawingBuffer,
        attributionControl: showAttribution,
      });
    }

    // Fallback reactivo si el estilo remoto da error (403/404/CORS)
    mapInstance.on('error', (e) => {
      const isStyleError = e?.error?.status === 403 || e?.error?.status === 404 || e?.sourceId === 'carto';
      if (isStyleError) {
        try {
          mapInstance.setStyle(OSM_RASTER_STYLE);
        } catch (_) {}
      }
    });

    if (showNavigation) {
      mapInstance.addControl(new maplibregl.NavigationControl(), 'top-right');
    }

    mapInstance.on('load', () => {
      mapInstance.resize();
      if (typeof onMapReady === 'function') onMapReady(mapInstance);
    });

    if (onMapClick) {
      mapInstance.on('click', (e) => {
        onMapClick({ latitude: e.lngLat.lat, longitude: e.lngLat.lng });
      });
    }

    const resize = () => {
      try {
        mapInstance.resize();
      } catch (_) {}
    };

    window.addEventListener('resize', resize);
    mapRef.current = mapInstance;

    return () => {
      window.removeEventListener('resize', resize);
      markerRefs.current.forEach((marker) => marker.remove());
      markerRefs.current = [];
      if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.remove();
        userLocationMarkerRef.current = null;
      }
      mapInstance.remove();
      mapRef.current = null;
    };
  }, []);

  // Efecto para actualizar el centro y zoom sin recrear el mapa
  useEffect(() => {
    if (mapRef.current && validCenter) {
      mapRef.current.flyTo({ center: validCenter, zoom, duration: 600 });
    }
  }, [validCenter, zoom]);

  // Renderizado dinámico de marcadores de incidentes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return undefined;

    markerRefs.current.forEach((marker) => marker.remove());
    markerRefs.current = [];

    markers.forEach((point) => {
      if (point.longitude == null || point.latitude == null) return;

      const markerElement = document.createElement('div');
      if (point.html) {
        markerElement.innerHTML = point.html;
      } else {
        markerElement.style.width = '18px';
        markerElement.style.height = '18px';
        markerElement.style.borderRadius = '999px';
        markerElement.style.border = '2px solid white';
        markerElement.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.25)';
        markerElement.style.background = point.color || '#dc2626';
      }

      if (onMarkerClick) {
        markerElement.style.cursor = 'pointer';
        markerElement.addEventListener('click', (e) => {
          e.stopPropagation();
          onMarkerClick(point.rawData || point);
        });
      }

      const marker = new maplibregl.Marker({ element: markerElement, anchor: 'center' })
        .setLngLat([point.longitude, point.latitude])
        .addTo(map);

      if (point.popupHtml && !onMarkerClick) {
        marker.setPopup(
          new maplibregl.Popup({ offset: 18, closeButton: true, closeOnClick: true }).setHTML(point.popupHtml)
        );
      }

      markerRefs.current.push(marker);
    });

    return undefined;
  }, [markers, onMarkerClick]);

  return <div ref={mapContainerRef} className={`h-full w-full min-h-[300px] ${className}`.trim()} />;
};

export default AwsLocationMap;
