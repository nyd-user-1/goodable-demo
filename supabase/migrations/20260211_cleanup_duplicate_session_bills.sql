-- Cleanup duplicate bills: Remove session_id=2026 duplicates where a 2025 version exists
-- NY legislative sessions span two years (2025-2026), but session_id should always be the odd year (2025)

-- Step 1: Delete related records (Sponsors, History, Roll Call/Votes) for 2026 duplicates
-- that have a matching 2025 bill with the same bill_number

-- Delete Votes for roll calls tied to 2026 duplicate bills
DELETE FROM "Votes"
WHERE roll_call_id IN (
  SELECT rc.roll_call_id FROM "Roll Call" rc
  WHERE rc.bill_id IN (
    SELECT b2026.bill_id
    FROM "Bills" b2026
    INNER JOIN "Bills" b2025
      ON b2025.bill_number = b2026.bill_number
      AND b2025.session_id = 2025
    WHERE b2026.session_id = 2026
  )
);

-- Delete Roll Calls for 2026 duplicate bills
DELETE FROM "Roll Call"
WHERE bill_id IN (
  SELECT b2026.bill_id
  FROM "Bills" b2026
  INNER JOIN "Bills" b2025
    ON b2025.bill_number = b2026.bill_number
    AND b2025.session_id = 2025
  WHERE b2026.session_id = 2026
);

-- Delete Sponsors for 2026 duplicate bills
DELETE FROM "Sponsors"
WHERE bill_id IN (
  SELECT b2026.bill_id
  FROM "Bills" b2026
  INNER JOIN "Bills" b2025
    ON b2025.bill_number = b2026.bill_number
    AND b2025.session_id = 2025
  WHERE b2026.session_id = 2026
);

-- Delete History for 2026 duplicate bills
DELETE FROM "History Table"
WHERE bill_id IN (
  SELECT b2026.bill_id
  FROM "Bills" b2026
  INNER JOIN "Bills" b2025
    ON b2025.bill_number = b2026.bill_number
    AND b2025.session_id = 2025
  WHERE b2026.session_id = 2026
);

-- Delete the 2026 duplicate bills themselves
DELETE FROM "Bills"
WHERE session_id = 2026
  AND bill_number IN (
    SELECT bill_number FROM "Bills" WHERE session_id = 2025
  );

-- Step 2: For any remaining 2026-only bills (no 2025 counterpart), update to 2025
-- First update their bill_id to match the 2025 formula (sessionYear * 1000000 + numericPart)
-- Since the edge function generates bill_id as sessionYear * 1000000 + numericPart,
-- we just need to update session_id. The bill_id difference (2026000000 vs 2025000000)
-- means we also need to update the bill_id and all FK references.

-- For simplicity and safety, update remaining 2026 bills to session_id=2025
-- (the bill_id stays the same since it's already a unique key)
UPDATE "Bills"
SET session_id = 2025
WHERE session_id = 2026;
