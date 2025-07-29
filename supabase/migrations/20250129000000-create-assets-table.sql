-- Create assets table for image management
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id TEXT UNIQUE NOT NULL, -- IMG-001, IMG-002, etc.
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT DEFAULT 'image',
  mime_type TEXT,
  size_bytes INTEGER,
  width INTEGER,
  height INTEGER,
  tags TEXT[] DEFAULT ARRAY['blog-image']::TEXT[],
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::JSONB,
  CONSTRAINT valid_type CHECK (type IN ('image', 'video', 'document'))
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_assets_tags ON public.assets USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_assets_uploaded_at ON public.assets (uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_assets_unique_id ON public.assets (unique_id);

-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images', 
  'blog-images', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'];

-- Enable RLS on assets table
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Assets are viewable by everyone" ON public.assets
  FOR SELECT USING (true);

CREATE POLICY "Users can upload assets" ON public.assets
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own assets" ON public.assets
  FOR UPDATE USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own assets" ON public.assets
  FOR DELETE USING (auth.uid() = uploaded_by);

-- Create function to generate unique IDs
CREATE OR REPLACE FUNCTION generate_asset_unique_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  counter INTEGER;
BEGIN
  -- Get the highest existing number
  SELECT COALESCE(MAX(CAST(SUBSTRING(unique_id FROM 5) AS INTEGER)), 0) + 1
  INTO counter
  FROM public.assets
  WHERE unique_id ~ '^IMG-[0-9]+$';
  
  -- Format as IMG-XXX with leading zeros
  new_id := 'IMG-' || LPAD(counter::TEXT, 3, '0');
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate unique_id
CREATE OR REPLACE FUNCTION set_asset_unique_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.unique_id IS NULL THEN
    NEW.unique_id := generate_asset_unique_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_asset_unique_id
  BEFORE INSERT ON public.assets
  FOR EACH ROW
  EXECUTE FUNCTION set_asset_unique_id();

-- Create updated_at trigger
CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Storage policies for blog-images bucket
CREATE POLICY "Anyone can view blog images" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-images');

CREATE POLICY "Authenticated users can upload blog images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'blog-images' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update their own blog images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'blog-images' 
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own blog images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'blog-images' 
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );