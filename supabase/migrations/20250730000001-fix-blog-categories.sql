-- Fix blog categories constraint error
-- First, check what categories exist and standardize them

-- Update existing categories to match our new constraint
UPDATE blog_proposals 
SET category = CASE 
  WHEN category ILIKE '%problem%' THEN 'problems'
  WHEN category ILIKE '%proposal%' OR category ILIKE '%policy%' THEN 'proposals'
  WHEN category ILIKE '%post%' OR category ILIKE '%blog%' THEN 'posts'
  WHEN category ILIKE '%announcement%' OR category ILIKE '%news%' THEN 'announcements'
  ELSE 'posts'  -- Default for any other categories
END
WHERE category IS NOT NULL;

-- Now add the constraint (it should work now)
ALTER TABLE blog_proposals 
DROP CONSTRAINT IF EXISTS blog_proposals_category_check;

ALTER TABLE blog_proposals
ADD CONSTRAINT blog_proposals_category_check 
CHECK (category IS NULL OR category IN ('problems', 'proposals', 'posts', 'announcements'));

-- Add comment for clarity
COMMENT ON CONSTRAINT blog_proposals_category_check ON blog_proposals IS 'Blog categories: problems, proposals, posts, announcements';