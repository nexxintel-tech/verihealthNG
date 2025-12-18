-- Secure Risk Scores View Migration
-- Run this AFTER the initial schema migration

-- 1. Create materialized view for performance (latest risk score per patient)
CREATE MATERIALIZED VIEW IF NOT EXISTS latest_risk_scores AS
SELECT DISTINCT ON (patient_id)
  id,
  patient_id,
  score,
  risk_level,
  last_sync,
  created_at,
  updated_at
FROM risk_scores
ORDER BY patient_id, updated_at DESC;

-- Create index for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_latest_risk_scores_patient_id 
  ON latest_risk_scores(patient_id);

-- 2. Create secure view that enforces RLS logic
CREATE OR REPLACE VIEW latest_risk_scores_secure AS
SELECT 
  lrs.id,
  lrs.patient_id,
  lrs.score,
  lrs.risk_level,
  lrs.last_sync,
  lrs.updated_at,
  p.name as patient_name,
  p.age as patient_age,
  p.gender as patient_gender,
  p.status as patient_status,
  p.user_id
FROM latest_risk_scores lrs
JOIN patients p ON p.id = lrs.patient_id
WHERE
  -- Clinicians and admins can see all patients
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('clinician', 'admin')
  )
  OR
  -- Patients can only see their own data
  p.user_id = auth.uid();

-- 3. Grant SELECT permission to authenticated users
GRANT SELECT ON latest_risk_scores_secure TO authenticated;

-- 4. Create function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_latest_risk_scores()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY latest_risk_scores;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Optional: Auto-refresh on risk_scores insert/update
-- This trigger ensures the materialized view stays fresh
CREATE OR REPLACE FUNCTION trigger_refresh_latest_risk_scores()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM refresh_latest_risk_scores();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_risk_scores_on_change
AFTER INSERT OR UPDATE OR DELETE ON risk_scores
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_latest_risk_scores();

COMMENT ON VIEW latest_risk_scores_secure IS 'Secure view that filters risk scores based on user role - clinicians see all, patients see only their own';
COMMENT ON MATERIALIZED VIEW latest_risk_scores IS 'Materialized view containing the latest risk score for each patient';
