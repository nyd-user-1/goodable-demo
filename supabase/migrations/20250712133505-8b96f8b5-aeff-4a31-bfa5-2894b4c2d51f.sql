-- Fix the infinite recursion issue in legislative_drafts RLS policies
-- Drop the problematic policy first
DROP POLICY IF EXISTS "Users can update their own drafts and co-authored drafts" ON legislative_drafts;

-- Create a corrected policy that doesn't reference itself
CREATE POLICY "Users can update their own drafts and co-authored drafts" 
ON legislative_drafts 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  OR 
  EXISTS (
    SELECT 1
    FROM co_authors ca
    WHERE ca.legislative_draft_id = legislative_drafts.id 
    AND ca.user_id = auth.uid() 
    AND ca.status = 'accepted'
    AND ca.role = ANY (ARRAY['owner', 'collaborator'])
  )
);

-- Also fix the SELECT policy that has the same issue
DROP POLICY IF EXISTS "Users can view their own drafts and co-authored drafts" ON legislative_drafts;

CREATE POLICY "Users can view their own drafts and co-authored drafts" 
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