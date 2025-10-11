-- Create a function to update committee member and bill counts
-- This can be called manually or set up as a scheduled job

CREATE OR REPLACE FUNCTION update_committee_counts()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update member counts
  UPDATE "Committees" c
  SET member_count = (
    SELECT COUNT(*)::text
    FROM "People" p
    WHERE p.committee_id = c.committee_name
      OR p.committee_id ILIKE '%' || c.committee_name || '%'
  )::text;

  -- Update bill counts
  UPDATE "Committees" c
  SET active_bills_count = (
    SELECT COUNT(*)::text
    FROM "Bills" b
    WHERE b.committee = c.committee_name
  )::text;

  RAISE NOTICE 'Committee counts updated successfully';
END;
$$;

-- Add a helpful comment
COMMENT ON FUNCTION update_committee_counts() IS 'Updates member_count and active_bills_count for all committees based on current People and Bills table data. Call this function after importing new data.';

-- Execute the function once to update all counts now
SELECT update_committee_counts();
