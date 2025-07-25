-- Ensure profile location fields exist
-- This migration ensures that all location fields are present in the profiles table

-- Add location columns if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS pen_name TEXT,
ADD COLUMN IF NOT EXISTS area_code TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS county TEXT,
ADD COLUMN IF NOT EXISTS state TEXT;

-- Add comments to explain the columns
COMMENT ON COLUMN public.profiles.pen_name IS 'Anonymous pen name for public policy proposals';
COMMENT ON COLUMN public.profiles.area_code IS 'Phone area code for geographic context';
COMMENT ON COLUMN public.profiles.zip_code IS 'ZIP code displayed with username/pen name for context';
COMMENT ON COLUMN public.profiles.city IS 'City or hamlet name';
COMMENT ON COLUMN public.profiles.county IS 'County name';
COMMENT ON COLUMN public.profiles.state IS 'State abbreviation (2 characters)';

-- Verify columns were added successfully
DO $$
BEGIN
    -- Check if all required columns exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'area_code') THEN
        RAISE EXCEPTION 'Failed to add area_code column to profiles table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'zip_code') THEN
        RAISE EXCEPTION 'Failed to add zip_code column to profiles table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'city') THEN
        RAISE EXCEPTION 'Failed to add city column to profiles table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'county') THEN
        RAISE EXCEPTION 'Failed to add county column to profiles table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'state') THEN
        RAISE EXCEPTION 'Failed to add state column to profiles table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'pen_name') THEN
        RAISE EXCEPTION 'Failed to add pen_name column to profiles table';
    END IF;
END $$;