import { NextRequest } from 'next/server';
import { executeMultiAgentPipeline } from '../../../lib/server/orchestrator';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sessionId = body.session_id || 'session_' + Date.now();
    const text = body.text || '';
    const langHint = body.lang_hint;
    const location = body.location;
    const locationName = body.location_name;
    const vesselProfile = body.vessel_profile;
    const scenarioMode = body.scenario_mode;

    const encoder = new TextEncoder();
    const generator = executeMultiAgentPipeline({
      sessionId,
      text,
      langHint,
      location,
      locationName,
      vesselProfile,
      scenarioMode
    });

    const stream = new ReadableStream({
      async pull(controller) {
        try {
          const { value, done } = await generator.next();
          if (done) {
            controller.close();
          } else {
            controller.enqueue(encoder.encode(value));
          }
        } catch (err) {
          controller.error(err);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive'
      }
    });
  } catch (error) {
    console.error('API /api/chat error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process marine intelligence query' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
