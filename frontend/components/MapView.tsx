'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { useAppStore } from '../lib/store';
import {
  Layers, Clock, Play, Pause, Compass, MapPin,
  Eye, EyeOff, ShieldAlert, Sparkles, Navigation
} from 'lucide-react';

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const userMarker = useRef<maplibregl.Marker | null>(null);

  const {
    activeLayers,
    toggleLayer,
    timeSliderHour,
    setTimeSliderHour,
    selectedLocation,
    setSelectedLocation,
    scenarioMode
  } = useAppStore();

  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
  const [isPlayingForecast, setIsPlayingForecast] = useState(false);

  // Time slider auto play
  useEffect(() => {
    let interval: any = null;
    if (isPlayingForecast) {
      interval = setInterval(() => {
        setTimeSliderHour((timeSliderHour + 3) % 75);
      }, 900);
    }
    return () => clearInterval(interval);
  }, [isPlayingForecast, timeSliderHour, setTimeSliderHour]);

  // Initialize MapLibre GL
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Dark Matter tile style (zero keys required)
    const mapStyle: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        'carto-dark': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
            'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
            'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors © CARTO'
        }
      },
      layers: [
        {
          id: 'carto-dark-layer',
          type: 'raster',
          source: 'carto-dark',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    };

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [selectedLocation.lon, selectedLocation.lat],
      zoom: 7.5
    });

    map.current.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');

    // Click map to set pin
    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      setSelectedLocation({
        name: `Pin (${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E)`,
        lat: Number(lat.toFixed(4)),
        lon: Number(lng.toFixed(4))
      });
    });

    map.current.on('load', async () => {
      if (!map.current) return;

      // 1. Ports Layer
      try {
        const portsRes = await fetch('/api/layers/ports');
        const portsGeo = await portsRes.json();
        map.current.addSource('ports-source', { type: 'geojson', data: portsGeo });
        map.current.addLayer({
          id: 'ports_layer',
          type: 'circle',
          source: 'ports-source',
          paint: {
            'circle-radius': 6,
            'circle-color': '#38bdf8',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#030b17'
          }
        });

        // Click port to select
        map.current.on('click', 'ports_layer', (e: any) => {
          if (e.features && e.features[0]) {
            const props = e.features[0].properties;
            const geom = e.features[0].geometry;
            setSelectedLocation({
              name: props.name,
              lat: geom.coordinates[1],
              lon: geom.coordinates[0]
            });
          }
        });
      } catch (e) {
        console.error('Ports layer error:', e);
      }

      // 2. IMBL Boundary Layer
      try {
        const imblRes = await fetch('/api/layers/imbl');
        const imblGeo = await imblRes.json();
        map.current.addSource('imbl-source', { type: 'geojson', data: imblGeo });
        map.current.addLayer({
          id: 'imbl_layer',
          type: 'line',
          source: 'imbl-source',
          paint: {
            'line-color': '#ef4444',
            'line-width': 2.5,
            'line-dasharray': [3, 2]
          }
        });
      } catch (e) {
        console.error('IMBL layer error:', e);
      }

      // 3. Marine Protected Areas
      try {
        const mpaRes = await fetch('/api/layers/mpa');
        const mpaGeo = await mpaRes.json();
        map.current.addSource('mpa-source', { type: 'geojson', data: mpaGeo });
        map.current.addLayer({
          id: 'mpa_layer',
          type: 'fill',
          source: 'mpa-source',
          paint: {
            'fill-color': '#f97316',
            'fill-opacity': 0.25,
            'fill-outline-color': '#ea580c'
          }
        });
      } catch (e) {
        console.error('MPA layer error:', e);
      }

      // 4. Official INCOIS PFZ
      try {
        const pfzRes = await fetch('/api/layers/pfz_official');
        const pfzGeo = await pfzRes.json();
        map.current.addSource('pfz-official-source', { type: 'geojson', data: pfzGeo });
        map.current.addLayer({
          id: 'pfz_official_layer',
          type: 'fill',
          source: 'pfz-official-source',
          paint: {
            'fill-color': '#10b981',
            'fill-opacity': 0.35,
            'fill-outline-color': '#059669'
          }
        });
      } catch (e) {
        console.error('PFZ layer error:', e);
      }

      // 5. Cyclone track & cone
      try {
        const cycloneRes = await fetch('/api/layers/cyclone');
        const cycloneData = await cycloneRes.json();
        if (cycloneData.cone_polygon) {
          const coneGeo = {
            type: 'Feature',
            geometry: { type: 'Polygon', coordinates: [cycloneData.cone_polygon] }
          };
          map.current.addSource('cyclone-cone-source', { type: 'geojson', data: coneGeo as any });
          map.current.addLayer({
            id: 'cyclone_cone_layer',
            type: 'fill',
            source: 'cyclone-cone-source',
            paint: {
              'fill-color': '#dc2626',
              'fill-opacity': 0.2,
              'fill-outline-color': '#b91c1c'
            }
          });
        }
      } catch (e) {
        console.error('Cyclone layer error:', e);
      }
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update pin & fly to
  useEffect(() => {
    if (!map.current) return;

    if (!userMarker.current) {
      const el = document.createElement('div');
      el.className = 'w-7 h-7 rounded-full bg-saffron-500 border-2 border-white shadow-2xl flex items-center justify-center text-xs font-bold text-ocean-950 animate-bounce cursor-pointer';
      el.innerHTML = '⚓';
      userMarker.current = new maplibregl.Marker({ element: el })
        .setLngLat([selectedLocation.lon, selectedLocation.lat])
        .addTo(map.current);
    } else {
      userMarker.current.setLngLat([selectedLocation.lon, selectedLocation.lat]);
    }

    map.current.flyTo({
      center: [selectedLocation.lon, selectedLocation.lat],
      zoom: 8.5,
      essential: true
    });
  }, [selectedLocation]);

  // Sync layer visibility
  useEffect(() => {
    if (!map.current) return;
    Object.entries(activeLayers).forEach(([layerId, isVisible]) => {
      if (map.current?.getLayer(layerId)) {
        map.current.setLayoutProperty(layerId, 'visibility', isVisible ? 'visible' : 'none');
      }
    });
  }, [activeLayers]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* MapLibre Canvas */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Floating Layer Selector Pill (Top Right) */}
      <div className="fixed top-16 right-3 z-30 flex flex-col items-end">
        <button
          onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl glass-panel bg-ocean-950/90 hover:bg-ocean-900 border border-ocean-700 text-slate-200 text-xs font-bold shadow-2xl backdrop-blur-xl transition-all hover:scale-105"
        >
          <Layers className="w-4 h-4 text-ocean-400" />
          <span>GIS Layers</span>
        </button>

        {isLayerMenuOpen && (
          <div className="mt-2 w-64 glass-panel bg-ocean-950/95 rounded-2xl p-3.5 border border-ocean-700 shadow-2xl space-y-2 text-xs backdrop-blur-xl animate-in fade-in zoom-in duration-200">
            <div className="font-bold text-slate-200 border-b border-ocean-800 pb-1.5 flex items-center justify-between">
              <span>Marine Layers</span>
              <span className="text-[10px] text-ocean-300 font-mono">Live GIS</span>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
              {[
                { id: 'pfz_official_layer', name: 'Official INCOIS PFZ', color: '#10b981' },
                { id: 'imbl_layer', name: 'IMBL & Boundaries', color: '#ef4444' },
                { id: 'mpa_layer', name: 'Marine Protected Areas', color: '#f97316' },
                { id: 'ports_layer', name: 'Landing Centres & Ports', color: '#38bdf8' },
                { id: 'cyclone_cone_layer', name: 'Cyclone Warning Cone', color: '#dc2626' }
              ].map((layer) => (
                <label
                  key={layer.id}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-ocean-900/60 cursor-pointer text-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shadow"
                      style={{ backgroundColor: layer.color }}
                    />
                    <span className="text-xs font-medium">{layer.name}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!activeLayers[layer.id]}
                    onChange={() => toggleLayer(layer.id)}
                    className="rounded border-ocean-700 text-ocean-500 focus:ring-0 bg-ocean-950 cursor-pointer w-4 h-4"
                  />
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating 72-Hour Marine Forecast Time Slider (Bottom Center) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[calc(100vw-32px)] sm:w-[500px] glass-panel bg-ocean-950/90 rounded-2xl p-3 border border-ocean-700/80 shadow-2xl backdrop-blur-xl flex items-center gap-3 text-xs">
        <button
          onClick={() => setIsPlayingForecast(!isPlayingForecast)}
          className="p-2 rounded-xl bg-ocean-800 hover:bg-ocean-700 text-ocean-300 border border-ocean-600 transition-all shrink-0"
          title={isPlayingForecast ? 'Pause Forecast Animation' : 'Play 72h Forecast'}
        >
          {isPlayingForecast ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        <div className="flex items-center gap-1.5 font-bold text-ocean-300 shrink-0">
          <Clock className="w-3.5 h-3.5 text-saffron-400" />
          <span>+{timeSliderHour}h</span>
        </div>

        <input
          type="range"
          min={0}
          max={72}
          step={3}
          value={timeSliderHour}
          onChange={(e) => setTimeSliderHour(Number(e.target.value))}
          className="flex-1 accent-ocean-400 cursor-pointer h-2 bg-ocean-900 rounded-lg"
        />

        <div className="text-[11px] font-mono text-slate-300 shrink-0">
          {timeSliderHour === 0 ? 'Now (IST)' : `+${timeSliderHour}h Forecast`}
        </div>
      </div>
    </div>
  );
}
