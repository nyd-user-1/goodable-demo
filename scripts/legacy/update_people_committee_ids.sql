-- ============================================================================
-- SQL Script to Add and Populate committee_ids Column in People Table
-- ============================================================================
-- This script creates a committee_ids column in the People table and populates
-- it by parsing the committee_members field from each committee.
-- ============================================================================

-- STEP 1: Add the committee_ids column if it doesn't exist
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'People'
    AND column_name = 'committee_ids'
  ) THEN
    ALTER TABLE public."People" ADD COLUMN committee_ids text;
    RAISE NOTICE 'Added committee_ids column to People table';
  ELSE
    RAISE NOTICE 'committee_ids column already exists';
  END IF;
END $$;


-- STEP 2: PREVIEW - See sample of committee members before update
-- ============================================================================

SELECT
  c.committee_id,
  c.committee_name,
  c.committee_members,
  c.chamber
FROM public."Committees" c
WHERE c.committee_members IS NOT NULL
  AND c.committee_members != ''
ORDER BY c.committee_id
LIMIT 10;


-- STEP 3: Clear existing committee_ids (optional - run if re-populating)
-- ============================================================================

-- UPDATE public."People" SET committee_ids = NULL;


-- STEP 4: Populate committee_ids by parsing committee_members
-- ============================================================================

DO $$
DECLARE
  committee_rec RECORD;
  slug_rec RECORD;
  member_slug text;
  search_name text;
  member_rec RECORD;
  current_ids text;
  new_ids text;
BEGIN
  -- Loop through each committee that has members
  FOR committee_rec IN
    SELECT committee_id, committee_name, committee_members, chamber
    FROM public."Committees"
    WHERE committee_members IS NOT NULL
      AND committee_members != ''
  LOOP
    RAISE NOTICE 'Processing committee: % (ID: %)', committee_rec.committee_name, committee_rec.committee_id;

    -- Split the semicolon-separated member slugs
    FOR slug_rec IN
      SELECT TRIM(slug) as slug
      FROM unnest(string_to_array(committee_rec.committee_members, ';')) as slug
      WHERE TRIM(slug) != ''
    LOOP
      member_slug := slug_rec.slug;
      -- Convert slug to searchable name (hyphens to spaces)
      -- "andrew-hevesi" becomes "andrew hevesi"
      search_name := REPLACE(member_slug, '-', ' ');

      RAISE NOTICE '  Looking for member slug: % -> search: %', member_slug, search_name;

      -- Try to find matching person by name pattern
      BEGIN
        SELECT people_id, name, committee_ids INTO member_rec
        FROM public."People"
        WHERE name ILIKE '%' || search_name || '%'
          OR (first_name || ' ' || last_name) ILIKE '%' || search_name || '%'
        LIMIT 1;

        IF FOUND THEN
          RAISE NOTICE '    Found: % (ID: %)', member_rec.name, member_rec.people_id;

          -- Get current committee_ids
          current_ids := member_rec.committee_ids;

          -- Check if this committee_id is already in the list
          IF current_ids IS NULL OR current_ids = '' THEN
            new_ids := committee_rec.committee_id::text;
          ELSIF current_ids LIKE '%' || committee_rec.committee_id::text || '%' THEN
            -- Already exists, skip
            RAISE NOTICE '    Committee ID already exists for this member';
            new_ids := current_ids;
          ELSE
            -- Append with semicolon separator
            new_ids := current_ids || '; ' || committee_rec.committee_id::text;
          END IF;

          -- Update the person's committee_ids
          UPDATE public."People"
          SET committee_ids = new_ids
          WHERE people_id = member_rec.people_id;

          RAISE NOTICE '    Updated committee_ids to: %', new_ids;
        ELSE
          RAISE NOTICE '    No match found for: %', search_name;
        END IF;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '    Error processing member: %', SQLERRM;
      END;

    END LOOP;
  END LOOP;

  RAISE NOTICE 'Committee IDs population complete!';
END $$;


-- STEP 5: VERIFICATION - Check the results
-- ============================================================================

-- A) Count how many people have committee assignments
SELECT
  COUNT(*) FILTER (WHERE committee_ids IS NOT NULL AND committee_ids != '') as people_with_committees,
  COUNT(*) FILTER (WHERE committee_ids IS NULL OR committee_ids = '') as people_without_committees,
  COUNT(*) as total_people
FROM public."People";

-- B) Show sample of people with their committee IDs
SELECT
  people_id,
  name,
  chamber,
  committee_ids,
  array_length(string_to_array(committee_ids, ';'), 1) as num_committees
FROM public."People"
WHERE committee_ids IS NOT NULL AND committee_ids != ''
ORDER BY array_length(string_to_array(committee_ids, ';'), 1) DESC
LIMIT 20;

-- C) Show specific examples with committee names
SELECT
  p.people_id,
  p.name,
  p.chamber,
  p.committee_ids,
  string_agg(c.committee_name, '; ') as committee_names
FROM public."People" p
CROSS JOIN LATERAL unnest(string_to_array(p.committee_ids, ';')) as committee_id_str
LEFT JOIN public."Committees" c ON c.committee_id = TRIM(committee_id_str)::bigint
WHERE p.committee_ids IS NOT NULL AND p.committee_ids != ''
GROUP BY p.people_id, p.name, p.chamber, p.committee_ids
ORDER BY p.name
LIMIT 20;

-- D) Check specific members we know should have committees
-- (Andrew Hevesi, Khaleel Anderson from Children & Families)
SELECT
  people_id,
  name,
  chamber,
  committee_ids
FROM public."People"
WHERE name ILIKE '%hevesi%'
   OR name ILIKE '%anderson%'
   OR name ILIKE '%seawright%';


-- ============================================================================
-- NOTES
-- ============================================================================
--
-- The committee_ids field will contain semicolon-separated committee IDs like:
-- "10; 15; 23"
--
-- To use this in your application, you'll need to:
-- 1. Split the committee_ids string by ';'
-- 2. Trim each ID
-- 3. Query the Committees table for each ID
--
-- Example in the useMemberCommittees hook:
-- const committeeIds = member.committee_ids?.split(';').map(id => id.trim()) || [];
-- Then query Committees table with .in('committee_id', committeeIds)
-- ============================================================================
