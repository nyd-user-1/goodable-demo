-- Add assets column to blog_proposals table for storing images and other assets
-- This will support the public policy proposal blog and other asset needs

ALTER TABLE blog_proposals ADD COLUMN assets JSONB DEFAULT '[]'::jsonb;

-- Add a comment to document the assets column structure
COMMENT ON COLUMN blog_proposals.assets IS 'Array of asset objects with properties: {id, type, url, name, size, mime_type, alt_text}';

-- Create an index on the assets column for better query performance
CREATE INDEX IF NOT EXISTS idx_blog_proposals_assets ON blog_proposals USING GIN (assets);

-- Add a function to validate asset structure
CREATE OR REPLACE FUNCTION validate_blog_proposal_assets(assets_data jsonb)
RETURNS boolean AS $$
BEGIN
  -- Check if assets is an array
  IF jsonb_typeof(assets_data) != 'array' then
    RETURN false;
  END IF;
  
  -- For now, just return true - we can add more validation later
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Add a check constraint to ensure assets column has valid structure
ALTER TABLE blog_proposals ADD CONSTRAINT check_assets_structure 
  CHECK (validate_blog_proposal_assets(assets));

-- Also create a general assets table for storing asset metadata
CREATE TABLE IF NOT EXISTS assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'document', 'video', 'audio', 'other')),
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Add RLS to assets table
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Allow users to see all assets (for now - can be restricted later)
CREATE POLICY "Assets are viewable by everyone" ON assets
  FOR SELECT USING (true);

-- Allow authenticated users to upload assets
CREATE POLICY "Authenticated users can upload assets" ON assets
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = uploaded_by);

-- Allow users to update their own assets
CREATE POLICY "Users can update their own assets" ON assets
  FOR UPDATE USING (auth.uid() = uploaded_by) WITH CHECK (auth.uid() = uploaded_by);

-- Allow users to delete their own assets
CREATE POLICY "Users can delete their own assets" ON assets
  FOR DELETE USING (auth.uid() = uploaded_by);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_uploaded_by ON assets(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON assets(created_at);
CREATE INDEX IF NOT EXISTS idx_assets_metadata ON assets USING GIN (metadata);

-- Create trigger for updated_at
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert the heart terrarium image as the first asset for auth page background
INSERT INTO assets (
  name,
  original_name,
  url,
  type,
  mime_type,
  size_bytes,
  alt_text,
  caption,
  uploaded_by,
  metadata
) VALUES (
  'goodable-heart-terrarium',
  'goodable-heart-terrarium.png',
  '/goodable-heart-terrarium.png',
  'image',
  'image/png',
  0, -- Size unknown for now
  'Beautiful heart-shaped terrarium with Goodable branding in a greenhouse setting',
  'Heart terrarium background for authentication page',
  (SELECT id FROM auth.users LIMIT 1), -- Use first user as uploader, or system
  '{"usage": ["auth_background"], "tags": ["background", "heart", "terrarium", "brand"]}'::jsonb
) ON CONFLICT DO NOTHING;