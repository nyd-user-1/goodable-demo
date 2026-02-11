-- ============================================================
-- SQL fixes for Votes features
-- Run this ENTIRE block in the Supabase SQL Editor
-- ============================================================

-- 1. Fix get_votes_drilldown: prioritize No votes, increase limit
CREATE OR REPLACE FUNCTION get_votes_drilldown(p_people_id int)
RETURNS TABLE (
  bill_number text,
  bill_title text,
  date text,
  vote text
) LANGUAGE sql STABLE AS $$
  SELECT
    b.bill_number,
    b.title AS bill_title,
    rc.date,
    CASE
      WHEN v.vote_desc LIKE 'Y%' THEN 'Yes'
      WHEN v.vote_desc LIKE 'N%' AND v.vote_desc NOT LIKE 'NV%' THEN 'No'
      ELSE 'Other'
    END AS vote
  FROM "Votes" v
  LEFT JOIN "Roll Call" rc ON rc.roll_call_id = v.roll_call_id
  LEFT JOIN "Bills" b ON b.bill_id = rc.bill_id
  WHERE v.people_id = p_people_id
  ORDER BY
    CASE
      WHEN v.vote_desc LIKE 'N%' AND v.vote_desc NOT LIKE 'NV%' THEN 0
      WHEN v.vote_desc NOT LIKE 'Y%' AND v.vote_desc NOT LIKE 'N%' THEN 1
      ELSE 2
    END,
    rc.date DESC NULLS LAST
  LIMIT 100;
$$;

-- 2. New function: all votes for a member (for member detail Votes tab)
CREATE OR REPLACE FUNCTION get_member_votes_all(p_people_id int)
RETURNS TABLE (
  bill_number text,
  bill_title text,
  date text,
  vote text
) LANGUAGE sql STABLE AS $$
  SELECT
    b.bill_number,
    b.title AS bill_title,
    rc.date,
    CASE
      WHEN v.vote_desc LIKE 'Y%' THEN 'Yes'
      WHEN v.vote_desc LIKE 'N%' AND v.vote_desc NOT LIKE 'NV%' THEN 'No'
      ELSE 'Other'
    END AS vote
  FROM "Votes" v
  LEFT JOIN "Roll Call" rc ON rc.roll_call_id = v.roll_call_id
  LEFT JOIN "Bills" b ON b.bill_id = rc.bill_id
  WHERE v.people_id = p_people_id
  ORDER BY rc.date DESC NULLS LAST;
$$;

-- 3. New function: only No/Other votes for a member (for chat drawer context)
CREATE OR REPLACE FUNCTION get_member_opposition_votes(p_people_id int)
RETURNS TABLE (
  bill_number text,
  bill_title text,
  date text,
  vote text
) LANGUAGE sql STABLE AS $$
  SELECT
    b.bill_number,
    b.title AS bill_title,
    rc.date,
    CASE
      WHEN v.vote_desc LIKE 'N%' AND v.vote_desc NOT LIKE 'NV%' THEN 'No'
      ELSE 'Other'
    END AS vote
  FROM "Votes" v
  LEFT JOIN "Roll Call" rc ON rc.roll_call_id = v.roll_call_id
  LEFT JOIN "Bills" b ON b.bill_id = rc.bill_id
  WHERE v.people_id = p_people_id
    AND NOT (v.vote_desc LIKE 'Y%')
  ORDER BY rc.date DESC NULLS LAST;
$$;

-- 4. Add Kevin Parker to his committees
-- First, let's find his slug pattern and update committee_members
UPDATE "Committees"
SET committee_members = CASE
  WHEN committee_members IS NULL OR committee_members = '' THEN 'kevin-parker'
  ELSE committee_members || ', kevin-parker'
END
WHERE committee_name ILIKE '%energy and telecommunications%'
   OR committee_name ILIKE '%banks%'
   OR committee_name ILIKE '%civil service and pensions%'
   OR committee_name ILIKE '%finance%'
   OR committee_name ILIKE '%health%'
   OR committee_name ILIKE '%internet and technology%'
   OR committee_name ILIKE '%judiciary%'
   OR committee_name ILIKE '%rules%';

-- Verification queries (run these after to confirm):
-- SELECT * FROM get_votes_drilldown(21944) LIMIT 5;
-- SELECT * FROM get_member_opposition_votes(21944) LIMIT 5;
-- SELECT committee_name FROM "Committees" WHERE committee_members ILIKE '%kevin-parker%';
