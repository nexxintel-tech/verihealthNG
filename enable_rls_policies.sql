-- VeriHealth: Complete RLS (Row Level Security) Policy Setup
-- Run this script in Supabase SQL Editor
-- This secures your database while keeping your backend working

-- ============================================================
-- STEP 1: ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinician_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 2: DROP EXISTING POLICIES (Clean Slate)
-- ============================================================

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- ============================================================
-- STEP 3: USERS TABLE POLICIES
-- ============================================================

-- Users can view their own record
CREATE POLICY "Users can view own record"
ON users FOR SELECT
USING (auth.uid()::text = id);

-- Users can update their own record
CREATE POLICY "Users can update own record"
ON users FOR UPDATE
USING (auth.uid()::text = id);

-- Admins and institution admins can view all users
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()::text
    AND u.role IN ('admin', 'institution_admin')
  )
);

-- ============================================================
-- STEP 4: INSTITUTIONS TABLE POLICIES
-- ============================================================

-- All authenticated users can view institutions
CREATE POLICY "Authenticated users can view institutions"
ON institutions FOR SELECT
USING (auth.role() = 'authenticated');

-- Only admins can insert/update/delete institutions
CREATE POLICY "Admins can manage institutions"
ON institutions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()::text
    AND u.role = 'admin'
  )
);

-- ============================================================
-- STEP 5: CLINICIAN PROFILES TABLE POLICIES
-- ============================================================

-- Clinicians can view their own profile
CREATE POLICY "Clinicians can view own profile"
ON clinician_profiles FOR SELECT
USING (auth.uid()::text = user_id);

-- Clinicians can update their own profile
CREATE POLICY "Clinicians can update own profile"
ON clinician_profiles FOR UPDATE
USING (auth.uid()::text = user_id);

-- Institution admins can view clinicians in their institution
CREATE POLICY "Institution admins can view institution clinicians"
ON clinician_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users admin_user
    JOIN users clinician_user ON clinician_user.id = clinician_profiles.user_id
    WHERE admin_user.id = auth.uid()::text
    AND admin_user.role = 'institution_admin'
    AND admin_user.institution_id = clinician_user.institution_id
  )
);

-- ============================================================
-- STEP 6: PATIENTS TABLE POLICIES
-- ============================================================

-- Patients can view their own record
CREATE POLICY "Patients can view own record"
ON patients FOR SELECT
USING (auth.uid()::text = user_id);

-- Patients can update their own record
CREATE POLICY "Patients can update own record"
ON patients FOR UPDATE
USING (auth.uid()::text = user_id);

-- Clinicians and admins can view all patients
CREATE POLICY "Clinicians can view all patients"
ON patients FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()::text
    AND u.role IN ('clinician', 'admin')
  )
);

-- Clinicians and admins can manage patients
CREATE POLICY "Clinicians can manage patients"
ON patients FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()::text
    AND u.role IN ('clinician', 'admin')
  )
);

-- ============================================================
-- STEP 7: CONDITIONS TABLE POLICIES
-- ============================================================

-- Patients can view their own conditions
CREATE POLICY "Patients can view own conditions"
ON conditions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM patients p
    WHERE p.id = conditions.patient_id
    AND p.user_id = auth.uid()::text
  )
);

-- Clinicians and admins can view all conditions
CREATE POLICY "Clinicians can view all conditions"
ON conditions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()::text
    AND u.role IN ('clinician', 'admin')
  )
);

-- Clinicians can manage conditions
CREATE POLICY "Clinicians can manage conditions"
ON conditions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()::text
    AND u.role IN ('clinician', 'admin')
  )
);

-- ============================================================
-- STEP 8: VITAL READINGS TABLE POLICIES
-- ============================================================

-- Patients can view their own vital readings
CREATE POLICY "Patients can view own vitals"
ON vital_readings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM patients p
    WHERE p.id = vital_readings.patient_id
    AND p.user_id = auth.uid()::text
  )
);

-- Patients can insert their own vital readings (from mobile app)
CREATE POLICY "Patients can insert own vitals"
ON vital_readings FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM patients p
    WHERE p.id = vital_readings.patient_id
    AND p.user_id = auth.uid()::text
  )
);

-- Clinicians and admins can view all vital readings
CREATE POLICY "Clinicians can view all vitals"
ON vital_readings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()::text
    AND u.role IN ('clinician', 'admin')
  )
);

-- ============================================================
-- STEP 9: RISK SCORES TABLE POLICIES
-- ============================================================

-- Patients can view their own risk scores
CREATE POLICY "Patients can view own risk scores"
ON risk_scores FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM patients p
    WHERE p.id = risk_scores.patient_id
    AND p.user_id = auth.uid()::text
  )
);

-- Clinicians and admins can view all risk scores
CREATE POLICY "Clinicians can view all risk scores"
ON risk_scores FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()::text
    AND u.role IN ('clinician', 'admin')
  )
);

-- Clinicians can manage risk scores
CREATE POLICY "Clinicians can manage risk scores"
ON risk_scores FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()::text
    AND u.role IN ('clinician', 'admin')
  )
);

-- ============================================================
-- STEP 10: ALERTS TABLE POLICIES
-- ============================================================

-- Clinicians and admins can view all alerts
CREATE POLICY "Clinicians can view all alerts"
ON alerts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()::text
    AND u.role IN ('clinician', 'admin')
  )
);

-- Clinicians and admins can update alerts (mark as read)
CREATE POLICY "Clinicians can update alerts"
ON alerts FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()::text
    AND u.role IN ('clinician', 'admin')
  )
);

-- Clinicians can manage alerts
CREATE POLICY "Clinicians can manage alerts"
ON alerts FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()::text
    AND u.role IN ('clinician', 'admin')
  )
);

-- ============================================================
-- STEP 11: VERIFICATION - Check All Policies Created
-- ============================================================

SELECT 
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=============================================';
  RAISE NOTICE 'RLS POLICIES CREATED SUCCESSFULLY!';
  RAISE NOTICE '=============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Your database is now protected with:';
  RAISE NOTICE '- Users: Can only see/edit their own record';
  RAISE NOTICE '- Institutions: All authenticated users can view';
  RAISE NOTICE '- Clinician Profiles: Clinicians see their own';
  RAISE NOTICE '- Patients: Patients see own, clinicians see all';
  RAISE NOTICE '- Conditions: Based on patient access';
  RAISE NOTICE '- Vital Readings: Based on patient access';
  RAISE NOTICE '- Risk Scores: Based on patient access';
  RAISE NOTICE '- Alerts: Clinicians and admins only';
  RAISE NOTICE '';
  RAISE NOTICE 'Your backend server (service role) bypasses these';
  RAISE NOTICE 'policies automatically - no changes needed!';
  RAISE NOTICE '=============================================';
END $$;
