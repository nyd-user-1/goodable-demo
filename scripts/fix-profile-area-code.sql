-- Quick fix for missing area_code column error
-- Run this script directly in Supabase SQL Editor if the migration hasn't been applied

-- Add the missing columns to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS pen_name TEXT,
ADD COLUMN IF NOT EXISTS area_code TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS county TEXT,
ADD COLUMN IF NOT EXISTS state TEXT;

-- Verify the columns were added
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
AND column_name IN ('pen_name', 'area_code', 'zip_code', 'city', 'county', 'state')
ORDER BY column_name;