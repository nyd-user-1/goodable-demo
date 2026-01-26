-- Lobbying Database Schema Normalization Migration
-- Creates proper SQL relationships between lobbying tables using 2025_lobbyist_dataset as the master table

-- ============================================
-- Step 1: Create normalization function
-- ============================================
-- This function matches the JavaScript normalizeLobbyistName function in useLobbyingSearch.ts
CREATE OR REPLACE FUNCTION normalize_lobbyist_name(name TEXT)
RETURNS TEXT AS $$
BEGIN
  IF name IS NULL THEN
    RETURN '';
  END IF;
  RETURN UPPER(
    TRIM(
      REGEXP_REPLACE(
        REGEXP_REPLACE(name, '[.,\-&''\"()]', '', 'g'),
        '\s+', ' ', 'g'
      )
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- Step 2: Create master lobbyists table
-- ============================================
CREATE TABLE IF NOT EXISTS lobbyists (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  type_of_lobbyist TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(normalized_name)
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_lobbyists_normalized_name ON lobbyists(normalized_name);
CREATE INDEX IF NOT EXISTS idx_lobbyists_name ON lobbyists(name);

-- ============================================
-- Step 3: Populate master table from 2025_lobbyist_dataset
-- ============================================
INSERT INTO lobbyists (name, normalized_name, type_of_lobbyist)
SELECT DISTINCT ON (normalize_lobbyist_name(principal_lobbyist))
  principal_lobbyist,
  normalize_lobbyist_name(principal_lobbyist),
  type_of_lobbyist
FROM "2025_lobbyist_dataset"
WHERE principal_lobbyist IS NOT NULL
  AND normalize_lobbyist_name(principal_lobbyist) != ''
ORDER BY normalize_lobbyist_name(principal_lobbyist), principal_lobbyist
ON CONFLICT (normalized_name) DO NOTHING;

-- ============================================
-- Step 4: Add foreign key columns to existing tables
-- ============================================

-- Add columns to lobbyist_compensation
ALTER TABLE lobbyist_compensation
ADD COLUMN IF NOT EXISTS lobbyist_id INTEGER REFERENCES lobbyists(id);

ALTER TABLE lobbyist_compensation
ADD COLUMN IF NOT EXISTS normalized_lobbyist TEXT;

-- Add columns to lobbyists_clients
ALTER TABLE lobbyists_clients
ADD COLUMN IF NOT EXISTS lobbyist_id INTEGER REFERENCES lobbyists(id);

ALTER TABLE lobbyists_clients
ADD COLUMN IF NOT EXISTS normalized_lobbyist TEXT;

-- ============================================
-- Step 5: Populate normalized names and foreign keys
-- ============================================

-- Update lobbyist_compensation with normalized names
UPDATE lobbyist_compensation
SET normalized_lobbyist = normalize_lobbyist_name(principal_lobbyist)
WHERE normalized_lobbyist IS NULL;

-- Update lobbyist_compensation with FK
UPDATE lobbyist_compensation lc
SET lobbyist_id = l.id
FROM lobbyists l
WHERE lc.normalized_lobbyist = l.normalized_name
  AND lc.lobbyist_id IS NULL;

-- Update lobbyists_clients with normalized names
UPDATE lobbyists_clients
SET normalized_lobbyist = normalize_lobbyist_name(principal_lobbyist)
WHERE normalized_lobbyist IS NULL;

-- Update lobbyists_clients with FK
UPDATE lobbyists_clients lc
SET lobbyist_id = l.id
FROM lobbyists l
WHERE lc.normalized_lobbyist = l.normalized_name
  AND lc.lobbyist_id IS NULL;

-- ============================================
-- Step 6: Create indexes for performance
-- ============================================

-- Index the FK columns
CREATE INDEX IF NOT EXISTS idx_lobbyist_compensation_lobbyist_id ON lobbyist_compensation(lobbyist_id);
CREATE INDEX IF NOT EXISTS idx_lobbyists_clients_lobbyist_id ON lobbyists_clients(lobbyist_id);

-- Index normalized columns for fallback text matching
CREATE INDEX IF NOT EXISTS idx_lobbyist_compensation_normalized ON lobbyist_compensation(normalized_lobbyist);
CREATE INDEX IF NOT EXISTS idx_lobbyists_clients_normalized ON lobbyists_clients(normalized_lobbyist);

-- ============================================
-- Step 7: Create comprehensive view for detail pages
-- ============================================
CREATE OR REPLACE VIEW lobbyist_full_profile AS
SELECT
  l.id AS lobbyist_id,
  l.name AS lobbyist_name,
  l.normalized_name,
  l.type_of_lobbyist,

  -- Compensation data (aggregated)
  lc.compensation,
  lc.reimbursed_expenses,
  lc.grand_total_compensation_expenses,

  -- Client count
  (SELECT COUNT(*) FROM lobbyists_clients lclients
   WHERE lclients.lobbyist_id = l.id) AS client_count,

  -- Dataset totals from 2025
  ds.total_compensation,
  ds.total_expenses
FROM lobbyists l
LEFT JOIN lobbyist_compensation lc ON lc.lobbyist_id = l.id
LEFT JOIN (
  SELECT
    normalize_lobbyist_name(principal_lobbyist) AS norm_name,
    SUM(CAST(NULLIF(REGEXP_REPLACE(compensation, '[$,]', '', 'g'), '') AS NUMERIC)) AS total_compensation,
    SUM(CAST(NULLIF(REGEXP_REPLACE(total_expenses, '[$,]', '', 'g'), '') AS NUMERIC)) AS total_expenses
  FROM "2025_lobbyist_dataset"
  GROUP BY normalize_lobbyist_name(principal_lobbyist)
) ds ON ds.norm_name = l.normalized_name;

-- ============================================
-- Step 8: Enable RLS on new table
-- ============================================
ALTER TABLE lobbyists ENABLE ROW LEVEL SECURITY;

-- Allow read access for all authenticated users
CREATE POLICY "Enable read access for all users" ON lobbyists
FOR SELECT TO authenticated USING (true);

-- Also allow anonymous read access (for public pages)
CREATE POLICY "Enable anonymous read access" ON lobbyists
FOR SELECT TO anon USING (true);
