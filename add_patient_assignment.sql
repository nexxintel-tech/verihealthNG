-- Add patient assignment and institution tracking
-- Run this in Supabase SQL Editor

-- Add assigned_clinician_id and institution_id to patients table
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS assigned_clinician_id VARCHAR REFERENCES users(id),
ADD COLUMN IF NOT EXISTS institution_id VARCHAR REFERENCES institutions(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_patients_assigned_clinician ON patients(assigned_clinician_id);
CREATE INDEX IF NOT EXISTS idx_patients_institution ON patients(institution_id);

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'patients' 
AND column_name IN ('assigned_clinician_id', 'institution_id');
