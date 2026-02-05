-- Add featured column for editorial picks
ALTER TABLE public.submitted_prompts
  ADD COLUMN featured BOOLEAN NOT NULL DEFAULT false;

-- Allow anyone to read submitted prompts (public prompt hub)
CREATE POLICY "Public can view all submitted prompts"
  ON public.submitted_prompts
  FOR SELECT
  USING (true);
