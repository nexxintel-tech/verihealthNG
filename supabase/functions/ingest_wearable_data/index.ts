import { serve } from 'std/server';
import { createClient } from 'npm:@supabase/supabase-js';

type IngestReading = {
  id?: string;
  deviceId?: string;
  device_id?: string;
  type: string;
  value?: number | string | Record<string, unknown> | null;
  unit?: string | null;
  timestamp: string;
  patient_id?: string | null;
  raw?: Record<string, unknown>;
};

// Known simple vitals that we persist into structured `vital_readings`
const KNOWN_VITALS = new Set([
  'heart_rate',
  'spo2',
  'temperature',
  'respiratory_rate',
  'steps',
  'blood_pressure',
]);

serve(async (req) => {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || (globalThis as any).process?.env?.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || (globalThis as any).process?.env?.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), { status: 500 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // Only accept JSON
  if (req.headers.get('content-type')?.includes('application/json') !== true) {
    return new Response(JSON.stringify({ error: 'Invalid content-type; expected application/json' }), { status: 400 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), { status: 400 });
  }

  const readings: IngestReading[] = Array.isArray(body.readings) ? body.readings : [];
  if (!readings.length) {
    return new Response(JSON.stringify({ error: 'No readings provided' }), { status: 400 });
  }

  // Validate each reading minimally and collect device ids
  const deviceIds = new Set<string>();
  for (const r of readings) {
    const deviceId = (r.device_id || r.deviceId || '').toString();
    if (!deviceId) return new Response(JSON.stringify({ error: 'reading missing deviceId/device_id' }), { status: 400 });
    if (!r.type) return new Response(JSON.stringify({ error: 'reading missing type' }), { status: 400 });
    if (!r.timestamp) return new Response(JSON.stringify({ error: 'reading missing timestamp' }), { status: 400 });
    // quick timestamp parse
    if (isNaN(Date.parse(r.timestamp))) return new Response(JSON.stringify({ error: 'invalid timestamp format' }), { status: 400 });
    deviceIds.add(deviceId);
  }

  // Check device assignments: ensure each device has a currently assigned patient
  const deviceToPatient = new Map<string, string | null>();
  for (const deviceId of deviceIds) {
    // Expect a table `device_assignments` with a single active assignment per device
    const { data: assignments, error } = await supabase
      .from('device_assignments')
      .select('patient_id, revoked_at, assigned_at')
      .eq('device_id', deviceId)
      .order('assigned_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('device_assignments query error', error);
      return new Response(JSON.stringify({ error: 'Server error while validating device assignments' }), { status: 500 });
    }

    const row = Array.isArray(assignments) && assignments.length ? assignments[0] : null;
    if (!row || row.revoked_at) {
      // No active assignment -> unauthorized
      return new Response(JSON.stringify({ error: `device ${deviceId} is not assigned to any patient` }), { status: 403 });
    }

    deviceToPatient.set(deviceId, row.patient_id as string);
  }

  // Prepare inserts
  const auditInserts: any[] = [];
  const structuredInserts: any[] = [];

  for (const r of readings) {
    const deviceId = (r.device_id || r.deviceId || '').toString();
    const patientId = deviceToPatient.get(deviceId) || null;

    // Build audit record for wearable_readings (raw payload preserved)
    auditInserts.push({
      id: r.id || undefined,
      device_id: deviceId,
      patient_id: patientId,
      type: r.type,
      value: typeof r.value === 'object' ? null : (r.value ?? null),
      unit: r.unit ?? null,
      timestamp: new Date(r.timestamp).toISOString(),
      raw_payload: r.raw ?? r,
      ingested_at: new Date().toISOString(),
      source: 'edge',
    });

    // If the type is known and value is scalar, insert into structured `vital_readings`
    if (KNOWN_VITALS.has(r.type)) {
      structuredInserts.push({
        patient_id: patientId,
        type: r.type,
        value: typeof r.value === 'number' ? r.value : (Number(r.value) || 0),
        unit: r.unit ?? null,
        timestamp: new Date(r.timestamp).toISOString(),
        status: 'normal',
      });
    } else {
      // Unknown or advanced vitals -> keep in audit `raw_payload` only (already added)
    }
  }

  // Insert audit records first
  const { error: auditErr } = await supabase.from('wearable_readings').insert(auditInserts);
  if (auditErr) {
    console.error('audit insert error', auditErr);
    return new Response(JSON.stringify({ error: 'Failed to insert audit readings' }), { status: 500 });
  }

  // Insert structured vitals (if any)
  if (structuredInserts.length) {
    const { error: structErr } = await supabase.from('vital_readings').insert(structuredInserts);
    if (structErr) {
      console.error('structured insert error', structErr);
      return new Response(JSON.stringify({ error: 'Failed to insert structured vitals' }), { status: 500 });
    }
  }

  return new Response(JSON.stringify({ success: true, inserted: { audit: auditInserts.length, structured: structuredInserts.length } }), { status: 200 });
});
