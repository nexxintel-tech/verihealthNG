-- Migration: create wearable_readings audit table
-- Date: 2025-12-13

-- Ensure pgcrypto is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS wearable_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  patient_id uuid NULL,
  type text NOT NULL,
  value double precision NOT NULL,
  unit text NULL,
  timestamp timestamptz NOT NULL,
  raw_payload jsonb NULL,
  source text NOT NULL DEFAULT 'edge',
  status text NOT NULL DEFAULT 'new',
  ingested_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes to support queries by patient and recent readings
CREATE INDEX IF NOT EXISTS idx_wearable_patient_ts ON wearable_readings (patient_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_wearable_timestamp ON wearable_readings (timestamp DESC);

-- Enable Row Level Security and add defensive policy: disallow client-side INSERTs.
ALTER TABLE wearable_readings ENABLE ROW LEVEL SECURITY;

-- Prevent direct INSERTs by authenticated non-service roles (Edge Functions / service role still bypass RLS)
CREATE POLICY no_client_insert ON wearable_readings
  FOR INSERT
  USING (false)
  WITH CHECK (true);
