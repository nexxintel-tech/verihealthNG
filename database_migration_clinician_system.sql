-- VeriHealth Clinician Registration & Institution System Migration
-- Run this script in your Supabase SQL Editor

-- 1. Create institutions table
CREATE TABLE IF NOT EXISTS institutions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Add new columns to users table
-- Note: approval_status defaults to NULL for existing users, but clinicians will be set to 'pending' on registration
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS institution_id VARCHAR REFERENCES institutions(id),
ADD COLUMN IF NOT EXISTS approval_status TEXT;

-- 3. Create clinician_profiles table
CREATE TABLE IF NOT EXISTS clinician_profiles (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  license_number TEXT,
  specialty TEXT,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Insert default institution
INSERT INTO institutions (name, address, contact_email, is_default)
VALUES (
  'VeriHealth Default Institution',
  'Default Address - To be configured',
  'admin@verihealth.com',
  true
)
ON CONFLICT DO NOTHING;

-- 5. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_institution ON users(institution_id);
CREATE INDEX IF NOT EXISTS idx_users_approval_status ON users(approval_status);
CREATE INDEX IF NOT EXISTS idx_clinician_profiles_user ON clinician_profiles(user_id);

-- 6. Verify migration
SELECT 
  'institutions' as table_name, 
  COUNT(*) as row_count 
FROM institutions
UNION ALL
SELECT 
  'clinician_profiles', 
  COUNT(*) 
FROM clinician_profiles;

-- Success! Tables created and default institution added.
-- You can now:
-- 1. Create institution_admin users in Supabase Auth
-- 2. Update their role to 'institution_admin' in the users table
-- 3. Set their institution_id to the default institution or create new institutions
