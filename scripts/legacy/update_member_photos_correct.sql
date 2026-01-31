-- ============================================================================
-- SQL Script to Update NY Assembly Member Photo URLs (CORRECT VERSION)
-- ============================================================================
-- This script updates photo_url using the DISTRICT NUMBER, not names
-- The actual URL pattern is:
-- https://nyassembly.gov/write/upload/member_files/{district}/headshot/{district}.jpg
-- ============================================================================

-- STEP 1: PREVIEW - See what the updates will look like
-- ============================================================================

SELECT
  people_id,
  name,
  district,
  photo_url as current_photo_url,
  CASE
    WHEN district IS NOT NULL AND district != '' AND district ~ '^\d+$' THEN
      'https://nyassembly.gov/write/upload/member_files/' ||
      LPAD(district, 3, '0') || '/headshot/' ||
      LPAD(district, 3, '0') || '_500.jpg'
    WHEN district IS NOT NULL AND district != '' AND district LIKE 'HD-%' THEN
      -- Handle "HD-078" format - extract the number
      'https://nyassembly.gov/write/upload/member_files/' ||
      SUBSTRING(district FROM '\d+') || '/headshot/' ||
      SUBSTRING(district FROM '\d+') || '_500.jpg'
    WHEN district IS NOT NULL AND district != '' AND district LIKE 'SD-%' THEN
      -- Senate districts - skip these, they're not assembly
      NULL
    ELSE NULL
  END as new_photo_url
FROM public."People"
WHERE chamber = 'Assembly' OR chamber = 'assembly'
ORDER BY district
LIMIT 50;


-- STEP 2: UPDATE - Apply the photo URL updates
-- ============================================================================

UPDATE public."People"
SET photo_url =
  CASE
    -- For pure numeric districts (e.g., "78", "031")
    WHEN district IS NOT NULL AND district != '' AND district ~ '^\d+$' THEN
      'https://nyassembly.gov/write/upload/member_files/' ||
      LPAD(TRIM(district), 3, '0') || '/headshot/' ||
      LPAD(TRIM(district), 3, '0') || '_500.jpg'

    -- For "HD-078" format districts
    WHEN district IS NOT NULL AND district != '' AND district LIKE 'HD-%' THEN
      'https://nyassembly.gov/write/upload/member_files/' ||
      SUBSTRING(district FROM '\d+') || '/headshot/' ||
      SUBSTRING(district FROM '\d+') || '_500.jpg'

    -- Skip Senate districts
    WHEN district IS NOT NULL AND district != '' AND district LIKE 'SD-%' THEN
      NULL

    ELSE NULL
  END
WHERE
  (chamber = 'Assembly' OR chamber = 'assembly' OR chamber ILIKE '%assembly%')
  AND district IS NOT NULL
  AND district != '';


-- STEP 3: VERIFICATION - Check the results
-- ============================================================================

-- A) Count how many were updated
SELECT
  chamber,
  COUNT(*) FILTER (WHERE photo_url IS NOT NULL AND photo_url LIKE 'https://nyassembly.gov%') as has_photo_url,
  COUNT(*) FILTER (WHERE photo_url IS NULL OR photo_url = '') as no_photo_url,
  COUNT(*) as total
FROM public."People"
GROUP BY chamber;

-- B) Show sample of updated Assembly members
SELECT
  people_id,
  name,
  district,
  chamber,
  photo_url
FROM public."People"
WHERE photo_url LIKE 'https://nyassembly.gov%'
ORDER BY district::int
LIMIT 30;

-- C) Check for Assembly members still missing photos
SELECT
  people_id,
  name,
  district,
  chamber,
  photo_url
FROM public."People"
WHERE (chamber = 'Assembly' OR chamber ILIKE '%assembly%')
  AND (photo_url IS NULL OR photo_url = '' OR photo_url = 'NULL')
ORDER BY district;


-- ============================================================================
-- EXAMPLE URLS THAT WILL BE GENERATED:
-- ============================================================================
-- District 78  (George Alvarez) → https://nyassembly.gov/write/upload/member_files/078/headshot/078_500.jpg
-- District 31  (Khaleel Anderson) → https://nyassembly.gov/write/upload/member_files/031/headshot/031_500.jpg
-- District 121 (Joe Angelino) → https://nyassembly.gov/write/upload/member_files/121/headshot/121_500.jpg
-- District 133 (Andrea Bailey) → https://nyassembly.gov/write/upload/member_files/133/headshot/133_500.jpg
-- District 120 (William Barclay) → https://nyassembly.gov/write/upload/member_files/120/headshot/120_500.jpg
--
-- Notes:
-- - District numbers are zero-padded to 3 digits (e.g., 78 becomes 078)
-- - Using _500.jpg for 500px image size
-- - The ?hst= timestamp parameter is NOT included (not required for images to load)
-- ============================================================================
