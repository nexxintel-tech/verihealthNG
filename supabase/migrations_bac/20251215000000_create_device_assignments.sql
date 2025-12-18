-- Migration: create device_assignments table
-- Date: 2025-12-15

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS device_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES users(id),
  assigned_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure only one active assignment per device (revoked_at IS NULL means active)
CREATE UNIQUE INDEX IF NOT EXISTS idx_device_assignments_active_device ON device_assignments (device_id) WHERE (revoked_at IS NULL);

-- Indexes to support lookups by patient and device
CREATE INDEX IF NOT EXISTS idx_device_assignments_patient ON device_assignments (patient_id);
CREATE INDEX IF NOT EXISTS idx_device_assignments_device ON device_assignments (device_id);

-- Enable Row Level Security for consistency with other tables
ALTER TABLE device_assignments ENABLE ROW LEVEL SECURITY;

-- Allow clinicians/service role to view assignments via a permissive SELECT policy (service role bypasses RLS)
CREATE POLICY "Clinicians can view device_assignments" ON device_assignments
  FOR SELECT USING (true);
