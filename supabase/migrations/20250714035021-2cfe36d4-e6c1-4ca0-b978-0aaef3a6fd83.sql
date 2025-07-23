
-- Fix the ambiguous column reference in the generate_problem_number function
CREATE OR REPLACE FUNCTION public.generate_problem_number()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  next_number INTEGER;
  problem_number TEXT;
BEGIN
  -- Get the next sequential number with fully qualified column name
  SELECT COALESCE(
    (SELECT MAX(CAST(SUBSTRING(pc.problem_number FROM 2) AS INTEGER)) + 1 
     FROM problem_chats pc 
     WHERE pc.problem_number ~ '^P[0-9]+$'), 
    1
  ) INTO next_number;
  
  -- Format as P00001, P00002, etc.
  problem_number := 'P' || LPAD(next_number::TEXT, 5, '0');
  
  RETURN problem_number;
END;
$function$
