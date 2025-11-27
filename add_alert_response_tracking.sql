-- Add clinician response tracking to alerts table
-- Run this in Supabase SQL Editor

ALTER TABLE alerts 
ADD COLUMN IF NOT EXISTS responded_by_id VARCHAR REFERENCES users(id),
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'alerts' 
AND column_name IN ('responded_by_id', 'responded_at');
