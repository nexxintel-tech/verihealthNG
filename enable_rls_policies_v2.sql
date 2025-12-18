-- VeriHealth: RLS Policy Setup (Version 2 - Core Tables Only)
-- Run this script in Supabase SQL Editor

-- ============================================================
-- STEP 1: ENABLE RLS ON CORE TABLES
-- ============================================================

ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS clinician_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS alerts ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Users can view own record"
ON users FOR SELECT
USING (auth.uid()::text = id);

CREATE POLICY "Users can update own record"
ON users FOR UPDATE
USING (auth.uid()::text = id);

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

CREATE POLICY "Authenticated users can view institutions"
ON institutions FOR SELECT
USING (auth.role() = 'authenticated');

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

CREATE POLICY "Clinicians can view own profile"
ON clinician_profiles FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Clinicians can update own profile"
ON clinician_profiles FOR UPDATE
USING (auth.uid()::text = user_id);

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

CREATE POLICY "Patients can view own record"
ON patients FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Patients can update own record"
ON patients FOR UPDATE
USING (auth.uid()::text = user_id);

CREATE POLICY "Clinicians can view all patients"
ON patients FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()::text
    AND u.role IN ('clinician', 'admin')
  )
);

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
-- STEP 7: ALERTS TABLE POLICIES
-- ============================================================

CREATE POLICY "Clinicians can view all alerts"
ON alerts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()::text
    AND u.role IN ('clinician', 'admin')
  )
);

CREATE POLICY "Clinicians can update alerts"
ON alerts FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()::text
    AND u.role IN ('clinician', 'admin')
  )
);

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
-- STEP 8: VERIFICATION
-- ============================================================

SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================
-- SUCCESS
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE 'RLS POLICIES CREATED SUCCESSFULLY!';
  RAISE NOTICE 'Tables secured: users, institutions, clinician_profiles, patients, alerts';
END $$;
