-- Add new columns to profiles table for pen name and location information
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS pen_name TEXT,
ADD COLUMN IF NOT EXISTS area_code TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS county TEXT,
ADD COLUMN IF NOT EXISTS state TEXT;

-- Add comments to explain the columns
COMMENT ON COLUMN profiles.pen_name IS 'Anonymous pen name for public policy proposals';
COMMENT ON COLUMN profiles.area_code IS 'Phone area code for geographic context';
COMMENT ON COLUMN profiles.zip_code IS 'ZIP code displayed with username/pen name for context';
COMMENT ON COLUMN profiles.city IS 'City or hamlet name';
COMMENT ON COLUMN profiles.county IS 'County name';
COMMENT ON COLUMN profiles.state IS 'State abbreviation (2 characters)';

-- Update the display_name column comment to reflect new purpose
COMMENT ON COLUMN profiles.display_name IS 'Public username for attribution (e.g., John S.)';