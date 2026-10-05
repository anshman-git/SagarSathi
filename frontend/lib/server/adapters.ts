import fs from 'fs';
import path from 'path';
import { SourceBadge } from '../types';

const DATA_DIR = path.join(process.cwd(), 'lib', 'data');

export async function fetchMarineData(lat: number, lon: number, forceDemo = false) {
  const now = new Date().toISOString();
  if (!forceDemo) {
    try {
      const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height,swell_wave_period,ocean_current_velocity,ocean_current_direction,sea_surface_temperature&timezone=auto&forecast_days=3`;
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 4500);
      const res = await fetch(url, { signal: controller.signal, next: { revalidate: 3600 } });
      clearTimeout(id);
      if (res.ok) {
        const data = await res.json();
        const hourly = data.hourly || {};
        return {
          source: 'LIVE' as SourceBadge,
          fetched_at: now,
          hourly,
          current_wave_height: (hourly.wave_height || [1.2])[0] ?? 1.2,
          current_swell_period: (hourly.swell_wave_period || [8.0])[0] ?? 8.0,
          current_swell_height: (hourly.swell_wave_height || [0.8])[0] ?? 0.8,
          current_sst: (hourly.sea_surface_temperature || [28.2])[0] ?? 28.2
        };
      }
    } catch (e) {
      // Fallback
    }
  }

  // Demo / Offline fallback
  const times = Array.from({ length: 72 }, (_, i) => `2026-10-06T${String(i % 24).padStart(2, '0')}:00`);
  return {
    source: 'DEMO' as SourceBadge,
    fetched_at: now,
    hourly: {
      time: times,
      wave_height: times.map((_, i) => Math.round((1.1 + 0.3 * Math.sin(i * 0.3)) * 100) / 100),
      wave_period: times.map(() => 8.0),
      swell_wave_height: times.map(() => 0.75),
      swell_wave_period: times.map(() => 8.5),
      sea_surface_temperature: times.map(() => 28.3)
    },
    current_wave_height: 1.2,
    current_swell_period: 8.5,
    current_swell_height: 0.75,
    current_sst: 28.3
  };
}

export async function fetchForecastData(lat: number, lon: number, forceDemo = false) {
  const now = new Date().toISOString();
  if (!forceDemo) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=wind_speed_10m,wind_gusts_10m,precipitation,cape,visibility,weather_code&timezone=auto&forecast_days=3`;
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 4500);
      const res = await fetch(url, { signal: controller.signal, next: { revalidate: 3600 } });
      clearTimeout(id);
      if (res.ok) {
        const data = await res.json();
        const hourly = data.hourly || {};
        const windSpeed = (hourly.wind_speed_10m || [16.0])[0] ?? 16.0;
        const windGusts = (hourly.wind_gusts_10m || [22.0])[0] ?? 22.0;
        const cape = (hourly.cape || [250.0])[0] ?? 250.0;
        const wcode = (hourly.weather_code || [1])[0] ?? 1;
        const hasLightning = [95, 96, 99].includes(wcode) || cape > 1000;

        return {
          source: 'LIVE' as SourceBadge,
          fetched_at: now,
          hourly,
          current_wind_speed_kmh: windSpeed,
          current_wind_gusts_kmh: windGusts,
          current_cape: cape,
          current_weather_code: wcode,
          lightning_risk: hasLightning
        };
      }
    } catch (e) {
      // Fallback
    }
  }

  return {
    source: 'DEMO' as SourceBadge,
    fetched_at: now,
    hourly: {
      time: Array.from({ length: 72 }, (_, i) => `2026-10-06T${String(i % 24).padStart(2, '0')}:00`),
      wind_speed_10m: Array.from({ length: 72 }, (_, i) => Math.round((14 + 5 * Math.sin(i * 0.25)) * 10) / 10),
      wind_gusts_10m: Array.from({ length: 72 }, (_, i) => Math.round((20 + 6 * Math.sin(i * 0.25)) * 10) / 10),
      precipitation: Array.from({ length: 72 }, () => 0),
      cape: Array.from({ length: 72 }, () => 280),
      weather_code: Array.from({ length: 72 }, () => 1)
    },
    current_wind_speed_kmh: 16.5,
    current_wind_gusts_kmh: 22.0,
    current_cape: 280.0,
    current_weather_code: 1,
    lightning_risk: false
  };
}

export function loadGeoLayer(layerName: string) {
  try {
    const geoMap: Record<string, string> = {
      ports: path.join(DATA_DIR, 'geo', 'ports_landing_centres.geojson'),
      imbl: path.join(DATA_DIR, 'geo', 'imbl_eez_indicative.geojson'),
      mpa: path.join(DATA_DIR, 'geo', 'marine_protected_areas.geojson'),
      pfz_official: path.join(DATA_DIR, 'demo', 'pfz_sample.geojson'),
      cyclone: path.join(DATA_DIR, 'demo', 'cyclone_scenario.json'),
      anomaly: path.join(DATA_DIR, 'demo', 'productivity_anomaly_mannar.json'),
      sst_chl_grids: path.join(DATA_DIR, 'demo', 'sst_chl_grids.json')
    };

    const filePath = geoMap[layerName];
    if (filePath && fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error(`Error loading layer ${layerName}:`, e);
  }
  return { type: 'FeatureCollection', features: [] };
}

export function searchGazetteer(query: string) {
  const portsGeo = loadGeoLayer('ports');
  const q = query.toLowerCase().trim();

  for (const feat of portsGeo?.features || []) {
    const props = feat.properties || {};
    const coords = feat.geometry?.coordinates || [80.298, 13.125];
    const name = (props.name || '').toLowerCase();
    const district = (props.district || '').toLowerCase();
    const state = (props.state || '').toLowerCase();
    const namesDict = props.names || {};

    if (
      q.includes(name) ||
      name.includes(q) ||
      q.includes(district) ||
      district.includes(q) ||
      Object.values(namesDict).some((v: any) => q.includes(String(v).toLowerCase()))
    ) {
      return {
        name: props.name,
        lat: coords[1],
        lon: coords[0],
        district: props.district,
        state: props.state
      };
    }
  }

  // Standard coastal hubs
  const aliases: Record<string, any> = {
    chennai: { name: 'Kasimedu Fishing Harbour, Chennai', lat: 13.125, lon: 80.298 },
    mandapam: { name: 'Mandapam Landing Centre', lat: 9.278, lon: 79.125 },
    rameswaram: { name: 'Rameswaram Fishing Jetty', lat: 9.2876, lon: 79.3129 },
    veraval: { name: 'Veraval Fishing Harbour, Gujarat', lat: 20.9, lon: 70.3667 },
    kochi: { name: 'Kochi (Thoppumpady) Harbour', lat: 9.9312, lon: 76.2673 },
    visakhapatnam: { name: 'Visakhapatnam Fishing Harbour', lat: 17.6868, lon: 83.2185 },
    vizag: { name: 'Visakhapatnam Fishing Harbour', lat: 17.6868, lon: 83.2185 },
    nagapattinam: { name: 'Nagapattinam Port', lat: 10.7667, lon: 79.85 },
    digha: { name: 'Shankarpur Harbour, Digha', lat: 21.6333, lon: 87.5667 },
    mumbai: { name: 'Sassoon Dock, Mumbai', lat: 18.9133, lon: 72.825 },
    mangalore: { name: 'Mangalore Old Port', lat: 12.8533, lon: 74.8344 }
  };

  for (const [k, v] of Object.entries(aliases)) {
    if (q.includes(k)) return v;
  }

  return { name: 'Kasimedu Fishing Harbour, Chennai', lat: 13.125, lon: 80.298 };
}
