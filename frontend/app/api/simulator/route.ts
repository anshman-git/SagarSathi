import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { checkGeofenceProximity } from '../../../../lib/server/analytics';
import { loadGeoLayer } from '../../../../lib/server/adapters';

export const dynamic = 'force-dynamic';

let simMemory = {
  is_running: false,
  track_id: 'palk_bay_imbl',
  speed_multiplier: 5,
  current_waypoint_idx: 0,
  current_lat: 9.278,
  current_lon: 79.125,
  heading: 85,
  speed_knots: 8.0,
  tier: 'SAFE',
  last_alert: 'Vessel operating safely inside Indian territorial waters.'
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.action === 'start') {
      simMemory.is_running = true;
      simMemory.track_id = body.track_id || 'palk_bay_imbl';
      simMemory.speed_multiplier = body.speed_multiplier || 5;
      simMemory.current_waypoint_idx = 0;
    } else if (body.action === 'stop') {
      simMemory.is_running = false;
    }
    return NextResponse.json({ status: 'ok', state: simMemory });
  } catch (e) {
    return NextResponse.json({ error: 'Simulator error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const trackPath = path.join(
      process.cwd(),
      'lib',
      'data',
      'demo',
      'vessel_tracks',
      `${simMemory.track_id}.json`
    );

    if (fs.existsSync(trackPath)) {
      const trackData = JSON.parse(fs.readFileSync(trackPath, 'utf-8'));
      const waypoints = trackData.waypoints || [];

      if (waypoints.length > 0 && simMemory.is_running) {
        simMemory.current_waypoint_idx =
          (simMemory.current_waypoint_idx + 1) % waypoints.length;
        const wp = waypoints[simMemory.current_waypoint_idx];
        simMemory.current_lat = wp.lat;
        simMemory.current_lon = wp.lon;
        simMemory.heading = wp.heading;
        simMemory.speed_knots = wp.speed_knots;

        const imblGeo = loadGeoLayer('imbl');
        const geo = checkGeofenceProximity(wp.lat, wp.lon, wp.heading, imblGeo?.features || []);
        simMemory.tier = geo.tier;
        simMemory.last_alert = geo.details;
      }
    }
  } catch (e) {
    // Keep fallback
  }

  return NextResponse.json(simMemory);
}
