-- ============================================================================
-- SQL Script to Update NY Assembly Member Photo URLs
-- ============================================================================
-- This script updates the photo_url column in the People table with
-- correctly formatted URLs from the NY Assembly website
-- ============================================================================

-- STEP 1: BACKUP - Create a backup of existing photo_url values
-- ============================================================================
-- Run this first to create a safety backup
-- You can use this to restore if something goes wrong

DO $$
BEGIN
  -- Create backup table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'people_photo_backup') THEN
    CREATE TABLE public.people_photo_backup AS
    SELECT people_id, photo_url, first_name, last_name, name, NOW() as backup_date
    FROM public."People";

    RAISE NOTICE 'Backup table created: people_photo_backup';
  ELSE
    -- If backup exists, you can either drop and recreate, or skip
    RAISE NOTICE 'Backup table already exists. Skipping backup creation.';
  END IF;
END $$;


-- STEP 2: PREVIEW - See what the updates will look like before applying
-- ============================================================================
-- Run this to preview the changes without actually updating anything

SELECT
  people_id,
  name,
  first_name,
  last_name,
  photo_url as current_photo_url,
  CASE
    WHEN first_name IS NOT NULL AND last_name IS NOT NULL THEN
      'https://nyassembly.gov/write/upload/member/' ||
      REPLACE(TRIM(first_name), ' ', '-') || '-' ||
      REPLACE(TRIM(last_name), ' ', '-') || '.jpg'
    ELSE NULL
  END as new_photo_url
FROM public."People"
WHERE photo_url IS NULL OR photo_url = 'NULL' OR photo_url = ''
ORDER BY last_name, first_name
LIMIT 50;


-- STEP 3: UPDATE - Apply the photo URL updates
-- ============================================================================
-- This is the main update statement that will set the photo URLs

UPDATE public."People"
SET photo_url =
  CASE
    -- Only update if we have both first_name and last_name
    WHEN first_name IS NOT NULL AND first_name != ''
         AND last_name IS NOT NULL AND last_name != '' THEN
      'https://nyassembly.gov/write/upload/member/' ||
      -- Replace spaces with hyphens in first name (handles compound first names)
      REPLACE(TRIM(first_name), ' ', '-') || '-' ||
      -- Replace spaces with hyphens in last name (handles compound last names)
      REPLACE(TRIM(last_name), ' ', '-') || '.jpg'
    ELSE
      -- Keep NULL if we don't have the required data
      NULL
  END
WHERE
  -- Only update records where photo_url is currently NULL, 'NULL' string, or empty
  (photo_url IS NULL OR photo_url = 'NULL' OR photo_url = '')
  -- And we have the data needed to construct the URL
  AND first_name IS NOT NULL AND first_name != ''
  AND last_name IS NOT NULL AND last_name != '';


-- STEP 4: VERIFICATION - Check the results
-- ============================================================================

-- A) Count how many were updated
SELECT
  COUNT(*) FILTER (WHERE photo_url IS NOT NULL AND photo_url LIKE 'https://nyassembly.gov%') as updated_count,
  COUNT(*) FILTER (WHERE photo_url IS NULL OR photo_url = 'NULL' OR photo_url = '') as still_null_count,
  COUNT(*) as total_count
FROM public."People";

-- B) Show sample of updated records
SELECT
  people_id,
  name,
  first_name,
  last_name,
  photo_url
FROM public."People"
WHERE photo_url LIKE 'https://nyassembly.gov%'
ORDER BY last_name, first_name
LIMIT 20;

-- C) Check for any records that still need photo URLs
SELECT
  people_id,
  name,
  first_name,
  last_name,
  photo_url
FROM public."People"
WHERE photo_url IS NULL OR photo_url = 'NULL' OR photo_url = ''
ORDER BY last_name, first_name;

-- D) Validate URL format (look for potential issues)
SELECT
  people_id,
  name,
  photo_url,
  CASE
    WHEN photo_url LIKE '%  %' THEN 'Contains double spaces'
    WHEN photo_url LIKE '% -%' OR photo_url LIKE '%- %' THEN 'Space near hyphen'
    WHEN LENGTH(photo_url) > 200 THEN 'URL too long'
    ELSE 'OK'
  END as validation_status
FROM public."People"
WHERE photo_url LIKE 'https://nyassembly.gov%'
  AND (
    photo_url LIKE '%  %' OR
    photo_url LIKE '% -%' OR
    photo_url LIKE '%- %' OR
    LENGTH(photo_url) > 200
  );


-- STEP 5: ROLLBACK (If Needed) - Restore from backup
-- ============================================================================
-- Only run this if something went wrong and you need to restore

-- UNCOMMENT THE LINES BELOW TO RESTORE FROM BACKUP
/*
UPDATE public."People" p
SET photo_url = b.photo_url
FROM public.people_photo_backup b
WHERE p.people_id = b.people_id;

-- Verify restoration
SELECT COUNT(*) as restored_count
FROM public."People";
*/


-- STEP 6: CLEANUP - Remove backup table (Optional)
-- ============================================================================
-- Only run this after you've verified everything is working correctly
-- and you no longer need the backup

-- UNCOMMENT THE LINE BELOW TO DROP THE BACKUP TABLE
/*
DROP TABLE IF EXISTS public.people_photo_backup;
*/


-- ============================================================================
-- NOTES AND TIPS
-- ============================================================================
--
-- 1. Run STEP 1 (backup) first before making any changes
-- 2. Run STEP 2 (preview) to see what will be updated
-- 3. If preview looks good, run STEP 3 (update)
-- 4. Run STEP 4 (verification) to check results
-- 5. Keep the backup table for at least a few days
-- 6. If photos don't load, it might be because:
--    - The person's photo isn't actually on the website
--    - The name format doesn't exactly match the URL pattern
--    - Special characters in names need different handling
--
-- EXAMPLE URLS THAT WILL BE GENERATED:
-- Joseph Addabbo → https://nyassembly.gov/write/upload/member/Joseph-Addabbo.jpg
-- William Barclay → https://nyassembly.gov/write/upload/member/William-Barclay.jpg
-- Rodneyse Bichotte Hermelyn → https://nyassembly.gov/write/upload/member/Rodneyse-Bichotte-Hermelyn.jpg
--
-- ============================================================================
