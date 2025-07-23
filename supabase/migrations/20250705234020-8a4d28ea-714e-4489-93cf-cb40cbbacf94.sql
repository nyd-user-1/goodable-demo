-- Create media_outputs table for generated media kit outputs
CREATE TABLE public.media_outputs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  legislative_draft_id UUID REFERENCES public.legislative_drafts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'press_release', 'social_media', 'infographic', etc.
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on media_outputs
ALTER TABLE public.media_outputs ENABLE ROW LEVEL SECURITY;

-- Create policies for media_outputs
CREATE POLICY "Users can view their own media outputs" 
ON public.media_outputs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own media outputs" 
ON public.media_outputs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own media outputs" 
ON public.media_outputs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media outputs" 
ON public.media_outputs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_media_outputs_updated_at
  BEFORE UPDATE ON public.media_outputs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();