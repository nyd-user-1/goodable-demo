-- Update committee member counts based on actual People table data
-- This migration counts members for each committee and updates the member_count column

-- Update member_count for each committee by counting associated members in People table
UPDATE "Committees" c
SET member_count = (
  SELECT COUNT(*)::text
  FROM "People" p
  WHERE p.committee_id = c.committee_name
    OR p.committee_id ILIKE '%' || c.committee_name || '%'
)::text;

-- Also update active_bills_count while we're at it
UPDATE "Committees" c
SET active_bills_count = (
  SELECT COUNT(*)::text
  FROM "Bills" b
  WHERE b.committee = c.committee_name
)::text;

-- Add a comment explaining these columns
COMMENT ON COLUMN "Committees".member_count IS 'Count of members assigned to this committee from People table';
COMMENT ON COLUMN "Committees".active_bills_count IS 'Count of active bills assigned to this committee from Bills table';
