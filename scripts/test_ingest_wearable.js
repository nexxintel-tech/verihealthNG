#!/usr/bin/env node
// Simple test script to POST a sample wearable payload to the Supabase Edge Function.
// Requires env vars: SUPABASE_SERVICE_ROLE_KEY and optionally SUPABASE_FUNCTION_URL

const url = process.env.SUPABASE_FUNCTION_URL || 'http://localhost:54321/functions/v1/ingest_wearable_data';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!key) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY in environment');
  console.error('Set it and retry, e.g. (PowerShell): $env:SUPABASE_SERVICE_ROLE_KEY = "<key>"; node scripts/test_ingest_wearable.js');
  process.exit(1);
}

const sample = {
  patient_id: 'test-patient-000',
  readings: [
    {
      device_id: 'mock-device-1',
      timestamp: new Date().toISOString(),
      heart_rate: 72,
      steps: 123,
      metadata: { source: 'unit-test' }
    }
  ]
};

(async () => {
  try {
    // Node 18+ has global fetch. If not available, instruct user to run under Node 18+ or use curl.
    if (typeof fetch !== 'function') {
      console.error('Global fetch() not available. Run this script with Node 18+ or use curl to POST the payload.');
      console.error('Example curl:');
      console.error(`curl -X POST ${url} -H "Authorization: Bearer ${key}" -H "Content-Type: application/json" -d '${JSON.stringify(sample)}'`);
      process.exit(2);
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify(sample)
    });

    const text = await res.text();
    console.log('Response status:', res.status);
    try {
      console.log('Response body:', JSON.parse(text));
    } catch (e) {
      console.log('Response body (raw):', text);
    }
    process.exit(res.ok ? 0 : 3);
  } catch (err) {
    console.error('Request error:', err);
    process.exit(1);
  }
})();
