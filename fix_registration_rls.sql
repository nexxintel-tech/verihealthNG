-- Fix RLS policies to allow user registration
-- Run this in your Supabase SQL Editor

-- ============================================================
-- OPTION 1: Add INSERT policies for registration (Recommended)
-- ============================================================

-- Allow authenticated users to insert their own user record during registration
-- The id must match the authenticated user's id
CREATE POLICY "Allow user self-registration"
ON users FOR INSERT
WITH CHECK (auth.uid()::text = id);

-- Allow authenticated users to insert their own clinician profile
CREATE POLICY "Allow clinician profile creation"
ON clinician_profiles FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- Allow authenticated users to insert their own patient record
CREATE POLICY "Allow patient record creation"
ON patients FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- ============================================================
-- OPTION 2: If service role key is being used correctly,
-- disable RLS on users table (Less secure but simpler)
-- ============================================================

-- Uncomment these lines if Option 1 doesn't work:
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE clinician_profiles DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- VERIFY: Check current RLS status
-- ============================================================

-- Run this to see current policies:
-- SELECT schemaname, tablename, policyname, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public';

-- Run this to see RLS status:
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public';
