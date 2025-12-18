-- VeriHealth Initial Schema Migration
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'clinician', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conditions table
CREATE TABLE IF NOT EXISTS conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vital readings table
CREATE TABLE IF NOT EXISTS vital_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  value DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'normal' CHECK (status IN ('normal', 'warning', 'critical')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Risk scores table
CREATE TABLE IF NOT EXISTS risk_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  last_sync TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patient_id)
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync logs table (for mobile app synchronization tracking)
CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  device_type TEXT NOT NULL CHECK (device_type IN ('ios', 'android')),
  sync_status TEXT NOT NULL CHECK (sync_status IN ('success', 'failed', 'partial')),
  records_synced INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_conditions_patient_id ON conditions(patient_id);
CREATE INDEX IF NOT EXISTS idx_vital_readings_patient_id ON vital_readings(patient_id);
CREATE INDEX IF NOT EXISTS idx_vital_readings_timestamp ON vital_readings(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_risk_scores_patient_id ON risk_scores(patient_id);
CREATE INDEX IF NOT EXISTS idx_alerts_patient_id ON alerts(patient_id);
CREATE INDEX IF NOT EXISTS idx_alerts_is_read ON alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_sync_logs_patient_id ON sync_logs(patient_id);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role to bypass RLS (for API access)
-- Clinicians can view all patients
CREATE POLICY "Clinicians can view all patients" ON patients
  FOR SELECT USING (true);

CREATE POLICY "Clinicians can view all conditions" ON conditions
  FOR SELECT USING (true);

CREATE POLICY "Clinicians can view all vital readings" ON vital_readings
  FOR SELECT USING (true);

CREATE POLICY "Clinicians can view all risk scores" ON risk_scores
  FOR SELECT USING (true);

CREATE POLICY "Clinicians can view all alerts" ON alerts
  FOR SELECT USING (true);

CREATE POLICY "Clinicians can update alerts" ON alerts
  FOR UPDATE USING (true);

-- Insert sample data for testing
INSERT INTO users (id, email, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'patient1@example.com', 'patient'),
  ('00000000-0000-0000-0000-000000000002', 'patient2@example.com', 'patient'),
  ('00000000-0000-0000-0000-000000000003', 'patient3@example.com', 'patient'),
  ('00000000-0000-0000-0000-000000000004', 'patient4@example.com', 'patient'),
  ('00000000-0000-0000-0000-000000000005', 'clinician@verihealth.com', 'clinician')
ON CONFLICT (email) DO NOTHING;

INSERT INTO patients (id, user_id, name, age, gender, status) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Eleanor Rigby', 72, 'Female', 'Active'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'John Doe', 45, 'Male', 'Active'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Jane Smith', 29, 'Female', 'Active'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'Robert Johnson', 65, 'Male', 'Active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO conditions (patient_id, name) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Hypertension'),
  ('10000000-0000-0000-0000-000000000001', 'Arrhythmia Risk'),
  ('10000000-0000-0000-0000-000000000002', 'Diabetes Early Detection'),
  ('10000000-0000-0000-0000-000000000002', 'Obesity'),
  ('10000000-0000-0000-0000-000000000003', 'Pregnancy Wellness'),
  ('10000000-0000-0000-0000-000000000004', 'Heart Failure Early Signs'),
  ('10000000-0000-0000-0000-000000000004', 'CKD Early Detection')
ON CONFLICT DO NOTHING;

INSERT INTO risk_scores (patient_id, score, risk_level, last_sync) VALUES
  ('10000000-0000-0000-0000-000000000001', 85, 'high', NOW() - INTERVAL '15 minutes'),
  ('10000000-0000-0000-0000-000000000002', 62, 'medium', NOW() - INTERVAL '1 day'),
  ('10000000-0000-0000-0000-000000000003', 12, 'low', NOW() - INTERVAL '30 minutes'),
  ('10000000-0000-0000-0000-000000000004', 78, 'high', NOW() - INTERVAL '2 hours')
ON CONFLICT (patient_id) DO UPDATE SET
  score = EXCLUDED.score,
  risk_level = EXCLUDED.risk_level,
  last_sync = EXCLUDED.last_sync,
  updated_at = NOW();

INSERT INTO alerts (patient_id, type, message, severity, is_read, timestamp) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Arrhythmia Warning', 'Irregular heart rhythm detected for 15 mins.', 'high', false, NOW() - INTERVAL '2 hours'),
  ('10000000-0000-0000-0000-000000000004', 'SpO2 Drop', 'Oxygen saturation dropped below 92% during sleep.', 'high', false, NOW() - INTERVAL '1 day'),
  ('10000000-0000-0000-0000-000000000002', 'Glucose Spike Risk', 'Predicted glucose spike based on recent activity.', 'medium', true, NOW() - INTERVAL '3 hours')
ON CONFLICT DO NOTHING;

-- Insert sample vital readings (last 7 days)
INSERT INTO vital_readings (patient_id, type, value, unit, timestamp, status)
SELECT 
  '10000000-0000-0000-0000-000000000001',
  'Heart Rate',
  70 + (random() * 20 - 10)::DECIMAL(5,1),
  'bpm',
  NOW() - (seq * INTERVAL '4 hours'),
  'normal'
FROM generate_series(0, 42) AS seq
ON CONFLICT DO NOTHING;

INSERT INTO vital_readings (patient_id, type, value, unit, timestamp, status)
SELECT 
  '10000000-0000-0000-0000-000000000001',
  'HRV',
  40 + (random() * 15 - 7.5)::DECIMAL(5,1),
  'ms',
  NOW() - (seq * INTERVAL '4 hours'),
  'normal'
FROM generate_series(0, 42) AS seq
ON CONFLICT DO NOTHING;

INSERT INTO vital_readings (patient_id, type, value, unit, timestamp, status)
SELECT 
  '10000000-0000-0000-0000-000000000001',
  'SpO2',
  98 + (random() * 3 - 1.5)::DECIMAL(5,1),
  '%',
  NOW() - (seq * INTERVAL '4 hours'),
  'normal'
FROM generate_series(0, 42) AS seq
ON CONFLICT DO NOTHING;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for risk_scores table
CREATE TRIGGER update_risk_scores_updated_at BEFORE UPDATE ON risk_scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE users IS 'User accounts for authentication';
COMMENT ON TABLE patients IS 'Patient demographics and profile information';
COMMENT ON TABLE conditions IS 'Medical conditions being monitored for each patient';
COMMENT ON TABLE vital_readings IS 'Health data synced from HealthKit/Health Connect';
COMMENT ON TABLE risk_scores IS 'AI-calculated risk scores for each patient';
COMMENT ON TABLE alerts IS 'Clinical alerts triggered by AI analysis';
COMMENT ON TABLE sync_logs IS 'Mobile app synchronization audit trail';
