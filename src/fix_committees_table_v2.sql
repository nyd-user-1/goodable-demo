-- Fix Committees table by adding missing columns
-- Run this in your Supabase SQL editor

-- First, let's see what columns already exist
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'Committees'
-- ORDER BY ordinal_position;

-- Add missing columns one by one (they will be skipped if they already exist)

-- Add committee_type column if it doesn't exist
ALTER TABLE "Committees" 
ADD COLUMN IF NOT EXISTS committee_type TEXT;

-- Add description column if it doesn't exist
ALTER TABLE "Committees" 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add meeting_schedule column if it doesn't exist
ALTER TABLE "Committees" 
ADD COLUMN IF NOT EXISTS meeting_schedule TEXT;

-- Add chair_email column if it doesn't exist
ALTER TABLE "Committees" 
ADD COLUMN IF NOT EXISTS chair_email TEXT;

-- Add next_meeting column if it doesn't exist
ALTER TABLE "Committees" 
ADD COLUMN IF NOT EXISTS next_meeting TIMESTAMPTZ;

-- Add address column if it doesn't exist
ALTER TABLE "Committees" 
ADD COLUMN IF NOT EXISTS address TEXT;

-- Enable Row Level Security if not already enabled
ALTER TABLE "Committees" ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and recreate it
DROP POLICY IF EXISTS "Allow public read access to committees" ON "Committees";

-- Create policy to allow all users to read committees
CREATE POLICY "Allow public read access to committees" 
ON "Committees" 
FOR SELECT 
TO public 
USING (true);

-- Now insert sample data only using columns that exist
-- This version doesn't assume committee_type exists initially
INSERT INTO "Committees" (committee_name, chamber, chair_name, description, meeting_schedule)
SELECT 
    'Committee on Finance',
    'Assembly',
    'John Smith',
    'Oversees state budget and fiscal matters',
    'Every Monday at 2:00 PM'
WHERE NOT EXISTS (SELECT 1 FROM "Committees" WHERE committee_name = 'Committee on Finance');

INSERT INTO "Committees" (committee_name, chamber, chair_name, description, meeting_schedule)
SELECT 
    'Committee on Education',
    'Senate',
    'Jane Doe',
    'Reviews education policy and school funding',
    'First Tuesday of each month at 10:00 AM'
WHERE NOT EXISTS (SELECT 1 FROM "Committees" WHERE committee_name = 'Committee on Education');

-- Update committee_type for existing records if the column was just added
UPDATE "Committees" 
SET committee_type = 'Standing' 
WHERE committee_type IS NULL;

-- Add sample chair emails based on chair names
UPDATE "Committees"
SET chair_email = LOWER(REPLACE(chair_name, ' ', '.')) || '@legislature.gov'
WHERE chair_email IS NULL AND chair_name IS NOT NULL;

-- Show the first few records to verify
SELECT * FROM "Committees" LIMIT 5;