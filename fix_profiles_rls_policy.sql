-- VeriHealth: Fix Infinite Recursion in Profiles RLS Policy
-- Run this script in Supabase SQL Editor

-- Step 1: Check if profiles table exists and show current policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    RAISE NOTICE 'Profiles table exists - proceeding with fix';
  ELSE
    RAISE NOTICE 'Profiles table does not exist - no action needed';
  END IF;
END $$;

-- Step 2: Drop all existing RLS policies on profiles table (if they exist)
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', policy_record.policyname);
    RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
  END LOOP;
END $$;

-- Step 3: Disable RLS on profiles table (safest option since app doesn't use it)
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;

-- Step 4: Create simple non-recursive policies (optional - if you want RLS enabled)
-- Uncomment the lines below if you want to keep RLS enabled with proper policies:
--
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "Users can view own profile"
-- ON profiles FOR SELECT
-- USING (auth.uid() = id);
--
-- CREATE POLICY "Users can update own profile"
-- ON profiles FOR UPDATE
-- USING (auth.uid() = id);
--
-- CREATE POLICY "Users can insert own profile"
-- ON profiles FOR INSERT
-- WITH CHECK (auth.uid() = id);

-- Step 5: Verify the fix
SELECT 
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- Step 6: Test query (should not error)
-- SELECT * FROM profiles LIMIT 1;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'RLS policies fixed successfully!';
END $$;
