-- Create NY Laws tables for comprehensive legal database

-- Main laws table with full-text search
CREATE TABLE IF NOT EXISTS ny_laws (
  id SERIAL PRIMARY KEY,
  law_id VARCHAR(10) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  chapter VARCHAR(10),
  law_type VARCHAR(20) DEFAULT 'CONSOLIDATED',
  full_text TEXT,
  structure JSONB,
  total_sections INTEGER DEFAULT 0,
  last_updated DATE,
  api_last_modified TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Individual law sections for granular search
CREATE TABLE IF NOT EXISTS ny_law_sections (
  id SERIAL PRIMARY KEY,
  law_id VARCHAR(10) REFERENCES ny_laws(law_id) ON DELETE CASCADE,
  location_id TEXT NOT NULL,
  parent_location_id TEXT,
  section_number VARCHAR(50),
  title TEXT,
  content TEXT,
  level INTEGER DEFAULT 1,
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(law_id, location_id)
);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_laws_fulltext ON ny_laws 
  USING GIN (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(full_text, '')));

CREATE INDEX IF NOT EXISTS idx_sections_fulltext ON ny_law_sections 
  USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '')));

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_laws_chapter ON ny_laws(chapter);
CREATE INDEX IF NOT EXISTS idx_laws_law_id ON ny_laws(law_id);
CREATE INDEX IF NOT EXISTS idx_laws_law_type ON ny_laws(law_type);
CREATE INDEX IF NOT EXISTS idx_sections_law_id ON ny_law_sections(law_id);
CREATE INDEX IF NOT EXISTS idx_sections_level ON ny_law_sections(level);
CREATE INDEX IF NOT EXISTS idx_sections_parent ON ny_law_sections(parent_location_id);

-- Enable Row Level Security
ALTER TABLE ny_laws ENABLE ROW LEVEL SECURITY;
ALTER TABLE ny_law_sections ENABLE ROW LEVEL SECURITY;

-- Allow public read access to laws
CREATE POLICY "Laws are publicly readable" ON ny_laws
  FOR SELECT USING (true);

CREATE POLICY "Law sections are publicly readable" ON ny_law_sections
  FOR SELECT USING (true);

-- Only authenticated users can modify laws (for admin purposes)
CREATE POLICY "Only authenticated users can insert laws" ON ny_laws
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Only authenticated users can update laws" ON ny_laws
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only authenticated users can delete laws" ON ny_laws
  FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only authenticated users can insert law sections" ON ny_law_sections
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Only authenticated users can update law sections" ON ny_law_sections
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only authenticated users can delete law sections" ON ny_law_sections
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_ny_laws_updated_at ON ny_laws;
CREATE TRIGGER update_ny_laws_updated_at 
  BEFORE UPDATE ON ny_laws 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Search function for legal queries
CREATE OR REPLACE FUNCTION search_ny_laws(
  search_term TEXT,
  limit_results INTEGER DEFAULT 20
) RETURNS TABLE (
  law_id VARCHAR(10),
  law_name TEXT,
  chapter VARCHAR(10),
  section_title TEXT,
  content_snippet TEXT,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    l.law_id,
    l.name as law_name,
    l.chapter,
    s.title as section_title,
    LEFT(s.content, 300) as content_snippet,
    GREATEST(
      ts_rank(to_tsvector('english', l.name), plainto_tsquery('english', search_term)),
      ts_rank(to_tsvector('english', s.content), plainto_tsquery('english', search_term))
    ) as relevance
  FROM ny_laws l
  LEFT JOIN ny_law_sections s ON l.law_id = s.law_id
  WHERE 
    to_tsvector('english', l.name) @@ plainto_tsquery('english', search_term)
    OR to_tsvector('english', l.full_text) @@ plainto_tsquery('english', search_term)
    OR to_tsvector('english', s.content) @@ plainto_tsquery('english', search_term)
  ORDER BY relevance DESC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

-- Function to get law details with sections
CREATE OR REPLACE FUNCTION get_law_details(p_law_id VARCHAR(10))
RETURNS TABLE (
  law_id VARCHAR(10),
  name TEXT,
  chapter VARCHAR(10),
  law_type VARCHAR(20),
  total_sections INTEGER,
  sections JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.law_id,
    l.name,
    l.chapter,
    l.law_type,
    l.total_sections,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'location_id', s.location_id,
          'section_number', s.section_number,
          'title', s.title,
          'content', s.content,
          'level', s.level
        ) ORDER BY s.sort_order
      ) FILTER (WHERE s.id IS NOT NULL),
      '[]'::jsonb
    ) as sections
  FROM ny_laws l
  LEFT JOIN ny_law_sections s ON l.law_id = s.law_id
  WHERE l.law_id = p_law_id
  GROUP BY l.law_id, l.name, l.chapter, l.law_type, l.total_sections;
END;
$$ LANGUAGE plpgsql;

-- Insert sample laws data for testing (this will be replaced by API sync)
INSERT INTO ny_laws (law_id, name, chapter, law_type, total_sections)
VALUES 
  ('ABP', 'Abandoned Property Law', '1', 'CONSOLIDATED', 0),
  ('AGM', 'Agriculture and Markets Law', '69', 'CONSOLIDATED', 0),
  ('ABC', 'Alcoholic Beverage Control Law', '3-B', 'CONSOLIDATED', 0),
  ('ACG', 'Alternative County Government Law', '11-B', 'CONSOLIDATED', 0),
  ('ACA', 'Arts and Cultural Affairs Law', '11-C', 'CONSOLIDATED', 0)
ON CONFLICT (law_id) DO NOTHING;