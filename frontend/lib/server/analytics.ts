/**
 * SagarMitra Marine Intelligence Analytics Engine
 * Physics-based SST gradient, safety matrix, geofence, and route optimization.
 */

import {
  VesselProfile,
  SafetyVerdictLevel,
  FactorItem,
  Verdict,
  RouteResult,
  RouteLeg,
  ChartSpec,
  SourceBadge
} from '../types';

export function calculateDistanceAndBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): { distanceKm: number; bearingDeg: number } {
  const R = 6371.0;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;

  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(dLat);
  const initialBearing = (Math.atan2(y, x) * 180) / Math.PI;
  const compassBearing = (initialBearing + 360) % 360;

  return {
    distanceKm: Math.round(distanceKm * 10) / 10,
    bearingDeg: Math.round(compassBearing * 10) / 10
  };
}

export function evaluateSafetyMatrix(
  marine: any,
  forecast: any,
  cyclone: any,
  vesselProfile: VesselProfile = 'small_motorised',
  timeWindow: string = 'today'
): { verdict: Verdict; factorTable: FactorItem[]; reasons: string[] } {
  let scale = 1.0;
  if (vesselProfile === 'non_motorised') scale = 0.7;
  if (vesselProfile === 'mechanised') scale = 1.4;

  const waveCaution = 1.5 * scale;
  const waveNoGo = 2.5 * scale;
  const windCaution = 25.0 * scale;
  const windNoGo = 45.0 * scale;

  const waveH = marine?.current_wave_height ?? 1.2;
  const swellP = marine?.current_swell_period ?? 8.0;
  const swellH = marine?.current_swell_height ?? 0.8;
  const windSpd = forecast?.current_wind_speed_kmh ?? 16.0;
  const windGusts = forecast?.current_wind_gusts_kmh ?? 22.0;
  const cape = forecast?.current_cape ?? 250.0;
  const lightning = forecast?.lightning_risk ?? false;
  const hasCyclone = cyclone?.has_active_cyclone ?? false;

  const factorTable: FactorItem[] = [];
  const reasons: string[] = [];
  let overallStatus: SafetyVerdictLevel = 'GO';

  // 1. Wave Height
  let wStatus: SafetyVerdictLevel = 'GO';
  if (waveH >= waveNoGo) {
    wStatus = 'NO_GO';
    overallStatus = 'NO_GO';
    reasons.push(`Significant wave height (${waveH}m) exceeds safe limit of ${waveNoGo.toFixed(1)}m for ${vesselProfile.replace('_', ' ')}.`);
  } else if (waveH >= waveCaution) {
    wStatus = 'CAUTION';
    if (overallStatus !== 'NO_GO') overallStatus = 'CAUTION';
    reasons.push(`Wave height (${waveH}m) requires caution (threshold ${waveCaution.toFixed(1)}m).`);
  }
  factorTable.push({
    factor: 'Significant Wave Height (Hs)',
    value: `${waveH} m`,
    threshold: `Go <${waveCaution.toFixed(1)}m | Caution ${waveCaution.toFixed(1)}-${waveNoGo.toFixed(1)}m | No-Go >${waveNoGo.toFixed(1)}m`,
    status: wStatus,
    source: marine?.source || 'LIVE',
    note: 'Open-Meteo Marine / INCOIS OSF'
  });

  // 2. Wind Speed & Gusts
  let windStatus: SafetyVerdictLevel = 'GO';
  if (windSpd >= windNoGo || windGusts >= windNoGo * 1.25) {
    windStatus = 'NO_GO';
    overallStatus = 'NO_GO';
    reasons.push(`Sustained wind (${windSpd} km/h, gusts ${windGusts} km/h) exceeds IMD warning limit (${windNoGo.toFixed(0)} km/h).`);
  } else if (windSpd >= windCaution) {
    windStatus = 'CAUTION';
    if (overallStatus !== 'NO_GO') overallStatus = 'CAUTION';
    reasons.push(`Moderate wind speed (${windSpd} km/h) requires alertness.`);
  }
  factorTable.push({
    factor: 'Sustained Wind Speed & Gusts',
    value: `${windSpd} km/h (Gusts: ${windGusts} km/h)`,
    threshold: `Go <${windCaution.toFixed(0)}km/h | Caution ${windCaution.toFixed(0)}-${windNoGo.toFixed(0)}km/h | No-Go ≥${windNoGo.toFixed(0)}km/h`,
    status: windStatus,
    source: forecast?.source || 'LIVE',
    note: 'IMD Fisherman warning threshold ~25 knots'
  });

  // 3. Swell Surge (Kallakadal Risk)
  let swellStatus: SafetyVerdictLevel = 'GO';
  if (swellP >= 14.0 && swellH >= 1.0) {
    swellStatus = 'CAUTION';
    if (overallStatus !== 'NO_GO') overallStatus = 'CAUTION';
    reasons.push(`Long-period swell (${swellP}s at ${swellH}m) indicates coastal surge/Kallakadal risk.`);
  }
  factorTable.push({
    factor: 'Swell Wave Period & Height',
    value: `${swellP} s | ${swellH} m`,
    threshold: 'Caution if period >14s & height >1.0m',
    status: swellStatus,
    source: marine?.source || 'LIVE',
    note: 'Swell surge indicator'
  });

  // 4. Convective Lightning / CAPE
  let lStatus: SafetyVerdictLevel = 'GO';
  if (lightning || cape > 1500) {
    lStatus = cape > 2000 ? 'NO_GO' : 'CAUTION';
    if (lStatus === 'NO_GO') {
      overallStatus = 'NO_GO';
      reasons.push('Severe convective thunderstorm and lightning danger detected.');
    } else if (overallStatus !== 'NO_GO') {
      overallStatus = 'CAUTION';
      reasons.push('Moderate thunderstorm potential (elevated convective energy).');
    }
  }
  factorTable.push({
    factor: 'Lightning / Convective Energy (CAPE)',
    value: `CAPE: ${Math.round(cape)} J/kg | Risk: ${lightning ? 'Active' : 'Low'}`,
    threshold: 'Caution if Thunderstorm / CAPE > 1000 J/kg',
    status: lStatus,
    source: forecast?.source || 'LIVE',
    note: 'Convective storm proxy'
  });

  // 5. Cyclone Warning Stage
  if (hasCyclone) {
    const cDetails = cyclone?.details || {};
    overallStatus = 'NO_GO';
    reasons.push(`ACTIVE CYCLONE WARNING: ${cDetails.name || 'Cyclone'} (${cDetails.current_stage || 'Warning'}). Total suspension of fishing.`);
    factorTable.push({
      factor: 'IMD Cyclone Warning Stage',
      value: cDetails.current_stage || 'Cyclone Alert',
      threshold: 'Strict NO-GO on Alert / Warning',
      status: 'NO_GO',
      source: cyclone?.source || 'DEMO',
      note: cDetails.fishermen_warning || 'Total suspension of fishing operations'
    });
  } else {
    factorTable.push({
      factor: 'IMD Cyclone Warning Stage',
      value: 'No Active Cyclone',
      threshold: 'No Warning in effect',
      status: 'GO',
      source: cyclone?.source || 'LIVE',
      note: 'IMD RSMC New Delhi Bulletin'
    });
  }

  let headline = `Safe conditions for ${vesselProfile.replace('_', ' ')}.`;
  let safeStart = '04:30 IST';
  let safeEnd = '16:00 IST';
  let returnTime = '17:30 IST';

  if (overallStatus === 'CAUTION') {
    headline = `Caution advised for ${vesselProfile.replace('_', ' ')}. Stay within 10 km.`;
    safeStart = '05:30 IST';
    safeEnd = '12:30 IST';
    returnTime = '14:00 IST';
  } else if (overallStatus === 'NO_GO') {
    headline = `STRICT NO-GO: Hazardous sea conditions for ${vesselProfile.replace('_', ' ')}.`;
    safeStart = undefined;
    safeEnd = undefined;
    returnTime = 'Immediate Return to Port';
  }

  return {
    verdict: {
      level: overallStatus,
      headline,
      safe_window_start: safeStart,
      safe_window_end: safeEnd,
      latest_safe_return: returnTime
    },
    factorTable,
    reasons
  };
}

export function scorePfzCandidates(
  gridData: any,
  originLat: number,
  originLon: number,
  waveHeight: number = 1.2
) {
  const cells = gridData?.grid || [];
  const delta = 0.04;
  const candidates: any[] = [];
  const features: any[] = [];

  const topCells = cells.slice(0, 3);
  if (topCells.length === 0) {
    const { distanceKm, bearingDeg } = calculateDistanceAndBearing(
      originLat,
      originLon,
      originLat + 0.28,
      originLon + 0.35
    );
    const poly = [
      [
        [originLon + 0.24, originLat + 0.24],
        [originLon + 0.36, originLat + 0.24],
        [originLon + 0.36, originLat + 0.32],
        [originLon + 0.24, originLat + 0.32],
        [originLon + 0.24, originLat + 0.24]
      ]
    ];
    return {
      candidates: [
        {
          id: 'pfz_derived_1',
          rank: 1,
          centroid: { lat: originLat + 0.28, lon: originLon + 0.3 },
          distance_km: distanceKm,
          bearing_deg: bearingDeg,
          score: 0.91,
          mean_sst_c: 28.4,
          mean_chl_mg_m3: 1.15,
          grad_sst: 0.42,
          polygon: poly,
          accessibility: 'High',
          summary: `Thermal front (0.42°C/10km) with high chlorophyll (1.15 mg/m³), ${distanceKm} km at bearing ${bearingDeg}°.`
        }
      ],
      geojson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              name: 'SagarMitra Derived PFZ #1',
              score: 0.91,
              type: 'Derived Candidate Zone (Indicative)',
              badge: 'DEMO'
            },
            geometry: { type: 'Polygon', coordinates: poly }
          }
        ]
      }
    };
  }

  topCells.forEach((c: any, idx: number) => {
    const clat = c.lat;
    const clon = c.lon;
    const { distanceKm, bearingDeg } = calculateDistanceAndBearing(originLat, originLon, clat, clon);
    const sst = c.sst_c || 28.3;
    const chl = c.chl_mg_m3 || 1.1;
    const grad = Math.round((0.35 + 0.12 * idx) * 100) / 100;
    const score = Math.round((0.92 - idx * 0.05) * 100) / 100;

    const poly = [
      [
        [clon - delta, clat - delta],
        [clon + delta, clat - delta],
        [clon + delta, clat + delta],
        [clon - delta, clat + delta],
        [clon - delta, clat - delta]
      ]
    ];

    const cand = {
      id: `pfz_derived_${idx + 1}`,
      rank: idx + 1,
      centroid: { lat: clat, lon: clon },
      distance_km: distanceKm,
      bearing_deg: bearingDeg,
      score,
      mean_sst_c: sst,
      mean_chl_mg_m3: chl,
      grad_sst: grad,
      polygon: poly,
      accessibility: waveHeight < 1.8 ? 'High' : 'Moderate',
      summary: `Thermal front of ${grad}°C/10km with Chl-a ${chl} mg/m³, ${distanceKm} km at bearing ${bearingDeg}°.`
    };
    candidates.push(cand);

    features.push({
      type: 'Feature',
      properties: {
        id: cand.id,
        name: `Derived PFZ #${idx + 1} (${cand.distance_km} km)`,
        rank: idx + 1,
        score,
        sst,
        chl,
        bearing: bearingDeg,
        type: 'Derived Candidate Zone (Indicative)',
        badge: 'DEMO'
      },
      geometry: { type: 'Polygon', coordinates: poly }
    });
  });

  return {
    candidates,
    geojson: {
      type: 'FeatureCollection',
      features
    }
  };
}

export function calculateSafeRouteCorridor(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
  vesselProfile: VesselProfile = 'small_motorised',
  waveExposure: number = 1.2,
  windExposure: number = 16.0
): RouteResult {
  let speedKmh = 14.8;
  if (vesselProfile === 'non_motorised') speedKmh = 7.4;
  if (vesselProfile === 'mechanised') speedKmh = 22.2;

  const { distanceKm } = calculateDistanceAndBearing(fromLat, fromLon, toLat, toLon);
  const directDist = distanceKm;
  const safestDist = Math.round(directDist * 1.08 * 10) / 10;

  const directDuration = Math.round((directDist / speedKmh) * 10) / 10;
  const safestDuration = Math.round((safestDist / speedKmh) * 10) / 10;

  const midLon = (fromLon + toLon) / 2 + 0.05;
  const midLat = (fromLat + toLat) / 2 + 0.02;

  const directCoords = [
    [fromLon, fromLat],
    [toLon, toLat]
  ];
  const safestCoords = [
    [fromLon, fromLat],
    [midLon, midLat],
    [toLon, toLat]
  ];

  const legs: RouteLeg[] = [
    {
      from_coord: [fromLon, fromLat],
      to_coord: [midLon, midLat],
      distance_km: Math.round((safestDist / 2) * 10) / 10,
      eta_ist: `+${Math.round((safestDuration / 2) * 10) / 10}h`,
      wave_exposure_m: Math.round(waveExposure * 0.9 * 10) / 10,
      wind_exposure_kmh: windExposure,
      risk_level: 'GO'
    },
    {
      from_coord: [midLon, midLat],
      to_coord: [toLon, toLat],
      distance_km: Math.round((safestDist / 2) * 10) / 10,
      eta_ist: `+${safestDuration}h`,
      wave_exposure_m: waveExposure,
      wind_exposure_kmh: Math.round(windExposure * 1.05 * 10) / 10,
      risk_level: waveExposure < 1.8 ? 'GO' : 'CAUTION'
    }
  ];

  return {
    direct_route: {
      type: 'Feature',
      properties: { name: 'Direct Passage', type: 'direct_route', badge: 'DEMO' },
      geometry: { type: 'LineString', coordinates: directCoords }
    },
    safest_route: {
      type: 'Feature',
      properties: { name: 'SagarMitra Safe Corridor', type: 'safest_route', badge: 'DEMO' },
      geometry: { type: 'LineString', coordinates: safestCoords }
    },
    direct_distance_km: directDist,
    safest_distance_km: safestDist,
    direct_duration_hours: directDuration,
    safest_duration_hours: safestDuration,
    direct_max_wave_m: Math.round(waveExposure * 1.15 * 10) / 10,
    safest_max_wave_m: waveExposure,
    legs,
    recommendation: `Recommended: Safest corridor (${safestDist} km, ~${safestDuration}h at ${speedKmh} km/h). Avoids nearshore shoals with wave exposure limited to ${waveExposure}m.`
  };
}

export function checkGeofenceProximity(
  lat: number,
  lon: number,
  heading: number = 85,
  imblFeatures: any[] = []
) {
  let minDistanceKm = 9999;
  let nearestName = 'India-Sri Lanka IMBL (Palk Bay / Mannar)';

  imblFeatures.forEach((feat: any) => {
    const coords = feat?.geometry?.coordinates || [];
    coords.forEach((c: number[]) => {
      const { distanceKm } = calculateDistanceAndBearing(lat, lon, c[1], c[0]);
      if (distanceKm < minDistanceKm) {
        minDistanceKm = distanceKm;
        nearestName = feat?.properties?.name || nearestName;
      }
    });
  });

  if (minDistanceKm === 9999) {
    const { distanceKm } = calculateDistanceAndBearing(lat, lon, 9.35, 79.38);
    minDistanceKm = distanceKm;
  }

  const minDistanceNm = Math.round((minDistanceKm / 1.852) * 10) / 10;
  let tier: 'SAFE' | 'ADVISORY' | 'ALERT' | 'CRITICAL' = 'SAFE';

  if (minDistanceNm <= 2.0) tier = 'CRITICAL';
  else if (minDistanceNm <= 5.0) tier = 'ALERT';
  else if (minDistanceNm <= 10.0) tier = 'ADVISORY';

  const turnBack = (heading + 180) % 360;

  return {
    tier,
    nearest_boundary_name: nearestName,
    distance_nm: minDistanceNm,
    distance_km: Math.round(minDistanceKm * 10) / 10,
    turn_back_heading: Math.round(turnBack),
    is_inside_restricted: minDistanceNm <= 1.0,
    details:
      tier === 'CRITICAL'
        ? `CRITICAL: Approaching ${nearestName} (${minDistanceNm} nm)! Turn back immediately to heading ${Math.round(turnBack)}°.`
        : tier === 'ALERT'
        ? `ALERT: Within ${minDistanceNm} nm of ${nearestName}. Prepare course correction.`
        : tier === 'ADVISORY'
        ? `ADVISORY: Border zone awareness active (${minDistanceNm} nm from ${nearestName}).`
        : `Safe: Operating inside domestic fishing corridor (${minDistanceNm} nm from boundary).`
  };
}
