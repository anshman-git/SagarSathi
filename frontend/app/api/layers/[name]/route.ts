import { NextRequest, NextResponse } from 'next/server';
import { loadGeoLayer } from '../../../../lib/server/adapters';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  const layerName = params.name;
  const data = loadGeoLayer(layerName);
  return NextResponse.json(data);
}
