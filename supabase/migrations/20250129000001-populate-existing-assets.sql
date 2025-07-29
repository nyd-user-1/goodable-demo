-- Populate the assets table with existing images from the public directory
-- This migration adds the existing static assets to the database

INSERT INTO public.assets (
  name, 
  original_name, 
  url, 
  type, 
  mime_type, 
  tags, 
  uploaded_at,
  metadata
) VALUES 
-- Logo assets
('oai-logo', 'OAI LOGO.png', '/OAI%20LOGO.png', 'image', 'image/png', ARRAY['logo'], '2024-01-01 10:00:00+00', '{"source": "migration", "legacy": true}'),
('pplx-logo', 'PPLX LOGO.png', '/PPLX%20LOGO.png', 'image', 'image/png', ARRAY['logo'], '2024-01-01 10:01:00+00', '{"source": "migration", "legacy": true}'),
('alt-ai-small-button', 'alt-ai-small-button.png', '/alt-ai-small-button.png', 'image', 'image/png', ARRAY['logo'], '2024-01-01 10:02:00+00', '{"source": "migration", "legacy": true}'),
('claude-ai-icon', 'claude-ai-icon-65aa.png', '/claude-ai-icon-65aa.png', 'image', 'image/png', ARRAY['logo'], '2024-01-01 10:03:00+00', '{"source": "migration", "legacy": true}'),
('goodable-pwa', 'goodable pwa.jpg', '/goodable%20pwa.jpg', 'image', 'image/jpeg', ARRAY['logo'], '2024-01-01 10:04:00+00', '{"source": "migration", "legacy": true}'),
('goodable-text', 'goodable-text.jpg', '/goodable-text.jpg', 'image', 'image/jpeg', ARRAY['logo'], '2024-01-01 10:05:00+00', '{"source": "migration", "legacy": true}'),

-- Blog image assets
('gdble-beach', 'gdble-beach.jpg', '/gdble-beach.jpg', 'image', 'image/jpeg', ARRAY['blog-image'], '2024-01-01 11:00:00+00', '{"source": "migration", "legacy": true}'),
('gdble-mtn-2', 'gdble-mtn-2.avif', '/gdble-mtn-2.avif', 'image', 'image/avif', ARRAY['blog-image'], '2024-01-01 11:01:00+00', '{"source": "migration", "legacy": true}'),
('gdble-mtn-3', 'gdble-mtn-3.jpg', '/gdble-mtn-3.jpg', 'image', 'image/jpeg', ARRAY['blog-image'], '2024-01-01 11:02:00+00', '{"source": "migration", "legacy": true}'),
('goodable-15-avif', 'goodable 15.avif', '/goodable%2015.avif', 'image', 'image/avif', ARRAY['blog-image'], '2024-01-01 11:03:00+00', '{"source": "migration", "legacy": true}'),
('goodable-15-png', 'goodable 15.png', '/goodable%2015.png', 'image', 'image/png', ARRAY['blog-image'], '2024-01-01 11:04:00+00', '{"source": "migration", "legacy": true}'),
('goodable-4', 'goodable 4.avif', '/goodable%204.avif', 'image', 'image/avif', ARRAY['blog-image'], '2024-01-01 11:05:00+00', '{"source": "migration", "legacy": true}'),
('goodable-botanical', 'goodable-botanical.avif', '/goodable-botanical.avif', 'image', 'image/avif', ARRAY['blog-image'], '2024-01-01 11:06:00+00', '{"source": "migration", "legacy": true}'),
('goodable-dandelion', 'goodable-dandelion.avif', '/goodable-dandelion.avif', 'image', 'image/avif', ARRAY['blog-image'], '2024-01-01 11:07:00+00', '{"source": "migration", "legacy": true}'),
('goodable-dream-state', 'goodable-dream-state.avif', '/goodable-dream-state.avif', 'image', 'image/avif', ARRAY['blog-image'], '2024-01-01 11:08:00+00', '{"source": "migration", "legacy": true}'),
('goodable-heart-pwa', 'goodable-heart-pwa.png', '/goodable-heart-pwa.png', 'image', 'image/png', ARRAY['blog-image'], '2024-01-01 11:09:00+00', '{"source": "migration", "legacy": true}'),
('goodable-heart', 'goodable-heart.avif', '/goodable-heart.avif', 'image', 'image/avif', ARRAY['blog-image'], '2024-01-01 11:10:00+00', '{"source": "migration", "legacy": true}'),
('goodable-mtn-1', 'goodable-mtn-1.avif', '/goodable-mtn-1.avif', 'image', 'image/avif', ARRAY['blog-image'], '2024-01-01 11:11:00+00', '{"source": "migration", "legacy": true}'),
('goodable-night', 'goodable-night.avif', '/goodable-night.avif', 'image', 'image/avif', ARRAY['blog-image'], '2024-01-01 11:12:00+00', '{"source": "migration", "legacy": true}'),
('goodable-path-2', 'goodable-path-2.avif', '/goodable-path-2.avif', 'image', 'image/avif', ARRAY['blog-image'], '2024-01-01 11:13:00+00', '{"source": "migration", "legacy": true}'),
('goodable-path', 'goodable-path.avif', '/goodable-path.avif', 'image', 'image/avif', ARRAY['blog-image'], '2024-01-01 11:14:00+00', '{"source": "migration", "legacy": true}')

ON CONFLICT (name) DO NOTHING;

-- Update the unique_id sequence to start after migrated assets
-- This ensures new uploads get proper sequential IDs
SELECT setval(
  pg_get_serial_sequence('assets', 'id'), 
  (SELECT COALESCE(MAX(CAST(SUBSTRING(unique_id FROM 5) AS INTEGER)), 0) FROM assets WHERE unique_id ~ '^IMG-[0-9]+$') + 1,
  false
);

-- Add comment explaining the migration
COMMENT ON TABLE public.assets IS 'Asset management table for Goodable images, videos, and documents. Populated with legacy assets via migration 20250129000001.';

-- Verify the migration worked
DO $$ 
DECLARE 
  asset_count INTEGER;
BEGIN 
  SELECT COUNT(*) INTO asset_count FROM public.assets WHERE metadata->>'source' = 'migration';
  RAISE NOTICE 'Successfully migrated % legacy assets to the database', asset_count;
END $$;