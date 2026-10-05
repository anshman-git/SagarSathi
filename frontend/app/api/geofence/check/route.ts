import { NextRequest, NextResponse } from 'next/server';
import { checkGeofenceProximity } from '../../../../lib/server/analytics';
import { loadGeoLayer } from '../../../../lib/server/adapters';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const lat = body.lat || 13.125;
    const lon = body.lon || 80.298;
    const heading = body.heading || 85;

    const imblGeo = loadGeoLayer('imbl');
    const res = checkGeofenceProximity(lat, lon, heading, imblGeo?.features || []);

    return NextResponse.json({
      ...res,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check geofence' }, { status: 500 });
  }
}
