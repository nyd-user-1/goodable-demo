-- Create co_authors table for collaborative draft management
CREATE TABLE public.co_authors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  legislative_draft_id UUID NOT NULL,
  user_id UUID NOT NULL,
  invited_by UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'collaborator', -- 'owner', 'collaborator', 'viewer'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(legislative_draft_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.co_authors ENABLE ROW LEVEL SECURITY;

-- Create policies for co_authors
CREATE POLICY "Users can view co-authorships for their drafts" 
ON public.co_authors 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  auth.uid() = invited_by OR
  EXISTS (
    SELECT 1 FROM public.legislative_drafts ld 
    WHERE ld.id = legislative_draft_id AND ld.user_id = auth.uid()
  )
);

CREATE POLICY "Draft owners can invite co-authors" 
ON public.co_authors 
FOR INSERT 
WITH CHECK (
  auth.uid() = invited_by AND
  EXISTS (
    SELECT 1 FROM public.legislative_drafts ld 
    WHERE ld.id = legislative_draft_id AND ld.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own co-authorship status" 
ON public.co_authors 
FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() = invited_by);

CREATE POLICY "Draft owners can remove co-authors" 
ON public.co_authors 
FOR DELETE 
USING (
  auth.uid() = invited_by OR
  EXISTS (
    SELECT 1 FROM public.legislative_drafts ld 
    WHERE ld.id = legislative_draft_id AND ld.user_id = auth.uid()
  )
);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_co_authors_updated_at
BEFORE UPDATE ON public.co_authors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update legislative_drafts RLS policies to support co-author access
DROP POLICY IF EXISTS "Users can view their own drafts" ON public.legislative_drafts;
CREATE POLICY "Users can view their own drafts and co-authored drafts" 
ON public.legislative_drafts 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  is_public = true OR
  EXISTS (
    SELECT 1 FROM public.co_authors ca 
    WHERE ca.legislative_draft_id = id 
    AND ca.user_id = auth.uid() 
    AND ca.status = 'accepted'
  )
);

DROP POLICY IF EXISTS "Users can update their own drafts" ON public.legislative_drafts;
CREATE POLICY "Users can update their own drafts and co-authored drafts" 
ON public.legislative_drafts 
FOR UPDATE 
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.co_authors ca 
    WHERE ca.legislative_draft_id = id 
    AND ca.user_id = auth.uid() 
    AND ca.status = 'accepted'
    AND ca.role IN ('owner', 'collaborator')
  )
);

-- Add co_author_count to track number of collaborators
ALTER TABLE public.legislative_drafts 
ADD COLUMN co_author_count INTEGER DEFAULT 0;

-- Create function to update co_author_count
CREATE OR REPLACE FUNCTION public.update_co_author_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'accepted' THEN
    UPDATE public.legislative_drafts 
    SET co_author_count = co_author_count + 1 
    WHERE id = NEW.legislative_draft_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
    UPDATE public.legislative_drafts 
    SET co_author_count = co_author_count + 1 
    WHERE id = NEW.legislative_draft_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'accepted' AND NEW.status != 'accepted' THEN
    UPDATE public.legislative_drafts 
    SET co_author_count = co_author_count - 1 
    WHERE id = NEW.legislative_draft_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'accepted' THEN
    UPDATE public.legislative_drafts 
    SET co_author_count = co_author_count - 1 
    WHERE id = OLD.legislative_draft_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for co_author_count updates
CREATE TRIGGER update_draft_co_author_count
AFTER INSERT OR UPDATE OR DELETE ON public.co_authors
FOR EACH ROW
EXECUTE FUNCTION public.update_co_author_count();