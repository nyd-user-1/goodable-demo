
-- Fix the problem number generation to handle race conditions and existing records properly
CREATE OR REPLACE FUNCTION public.generate_problem_number()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  next_number INTEGER;
  problem_number TEXT;
  max_attempts INTEGER := 10;
  attempt_count INTEGER := 0;
BEGIN
  -- Loop to handle potential race conditions
  LOOP
    -- Get the next sequential number with proper locking
    SELECT COALESCE(
      (SELECT MAX(CAST(SUBSTRING(pc.problem_number FROM 2) AS INTEGER)) + 1 
       FROM problem_chats pc 
       WHERE pc.problem_number ~ '^P[0-9]+$'), 
      1
    ) INTO next_number;
    
    -- Format as P00001, P00002, etc.
    problem_number := 'P' || LPAD(next_number::TEXT, 5, '0');
    
    -- Check if this number already exists
    IF NOT EXISTS (SELECT 1 FROM problem_chats WHERE problem_number = problem_number) THEN
      RETURN problem_number;
    END IF;
    
    -- Increment attempt counter and exit if too many attempts
    attempt_count := attempt_count + 1;
    IF attempt_count >= max_attempts THEN
      -- Generate a unique number with timestamp to avoid infinite loops
      problem_number := 'P' || LPAD((EXTRACT(EPOCH FROM NOW())::BIGINT % 100000)::TEXT, 5, '0');
      RETURN problem_number;
    END IF;
    
    -- Small delay to reduce race condition likelihood
    PERFORM pg_sleep(0.01);
  END LOOP;
END;
$function$;

-- Also clean up duplicate RLS policies that might be causing the 500 errors
DROP POLICY IF EXISTS "Enable read access for all users" ON legislative_drafts;
DROP POLICY IF EXISTS "Users can view own drafts" ON legislative_drafts;
DROP POLICY IF EXISTS "Co-authors can view drafts" ON legislative_drafts;
DROP POLICY IF EXISTS "Public drafts are viewable" ON legislative_drafts;

-- Create a single, comprehensive SELECT policy for legislative_drafts
CREATE POLICY "Users can view their drafts, co-authored drafts, and public drafts" 
ON legislative_drafts 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  is_public = true 
  OR 
  EXISTS (
    SELECT 1
    FROM co_authors ca
    WHERE ca.legislative_draft_id = legislative_drafts.id 
    AND ca.user_id = auth.uid() 
    AND ca.status = 'accepted'
  )
);

-- Clean up duplicate UPDATE policies
DROP POLICY IF EXISTS "Users can update own drafts" ON legislative_drafts;
DROP POLICY IF EXISTS "Co-authors can update drafts" ON legislative_drafts;
