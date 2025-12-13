import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

serve(async (req) => {
  // The service role key MUST be provided via environment variable on the server
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response('Server misconfigured', { status: 500 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  try {
    const body = await req.json();
    // Expect { readings: [ ... ] }
    const readings = body.readings || [];

    // Insert into `wearable_readings` audit table with server-side privileges
    const { error } = await supabase.from('wearable_readings').insert(
      readings.map((r: any) => ({
        id: r.id,
        device_id: r.deviceId,
        type: r.type,
        value: r.value,
        unit: r.unit || null,
        timestamp: r.timestamp,
        ingested_at: new Date().toISOString(),
      }))
    );

    if (error) {
      console.error('db insert error', error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e: any) {
    console.error('ingest error', e);
    return new Response(JSON.stringify({ error: e.message || String(e) }), { status: 400 });
  }
});
