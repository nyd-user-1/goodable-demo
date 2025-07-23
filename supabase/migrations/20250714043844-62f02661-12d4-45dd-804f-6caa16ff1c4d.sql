
-- Fix the infinite recursion issue in legislative_drafts RLS policies
-- The current policies are referencing the same table they're applied to, causing infinite loops

-- Drop the problematic policies first
DROP POLICY IF EXISTS "Users can view their own drafts and co-authored drafts" ON legislative_drafts;
DROP POLICY IF EXISTS "Users can update their own drafts and co-authored drafts" ON legislative_drafts;

-- Create corrected policies that don't reference themselves
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
