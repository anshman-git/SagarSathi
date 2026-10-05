import { NextRequest, NextResponse } from 'next/server';
import { calculateSafeRouteCorridor } from '../../../../lib/server/analytics';
import { searchGazetteer } from '../../../../lib/server/adapters';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const fromPort = body.from_port || 'Chennai';
    const toLat = body.to_lat || 13.45;
    const toLon = body.to_lon || 80.65;
    const vesselProfile = body.vessel_profile || 'small_motorised';

    const origin = searchGazetteer(fromPort);
    const result = calculateSafeRouteCorridor(
      origin.lat,
      origin.lon,
      toLat,
      toLon,
      vesselProfile,
      1.2,
      16.0
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to calculate safe route' }, { status: 500 });
  }
}
