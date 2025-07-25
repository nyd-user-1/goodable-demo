-- Ensure Committees table exists with proper structure
-- Run this in your Supabase SQL editor

-- Check if table exists and create if not
CREATE TABLE IF NOT EXISTS "Committees" (
    committee_id SERIAL PRIMARY KEY,
    committee_name TEXT,
    name TEXT,
    chamber TEXT,
    chair_name TEXT,
    chair_email TEXT,
    committee_type TEXT,
    description TEXT,
    meeting_schedule TEXT,
    next_meeting TIMESTAMPTZ,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE "Committees" ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to read committees
CREATE POLICY "Allow public read access to committees" 
ON "Committees" 
FOR SELECT 
TO public 
USING (true);

-- If you already have a Committees table but with different column names,
-- you can add aliases or rename columns:
-- ALTER TABLE "Committees" RENAME COLUMN old_name TO new_name;

-- Add some sample data if the table is empty
INSERT INTO "Committees" (committee_name, chamber, chair_name, committee_type, description, meeting_schedule)
SELECT 
    'Committee on Finance',
    'Assembly',
    'John Smith',
    'Standing',
    'Oversees state budget and fiscal matters',
    'Every Monday at 2:00 PM'
WHERE NOT EXISTS (SELECT 1 FROM "Committees" LIMIT 1);

INSERT INTO "Committees" (committee_name, chamber, chair_name, committee_type, description, meeting_schedule)
SELECT 
    'Committee on Education',
    'Senate',
    'Jane Doe',
    'Standing',
    'Reviews education policy and school funding',
    'First Tuesday of each month at 10:00 AM'
WHERE NOT EXISTS (SELECT 1 FROM "Committees" WHERE committee_name = 'Committee on Education');