-- Create submitted_prompts table for community prompt submissions
CREATE TABLE IF NOT EXISTS public.submitted_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Bills', 'Policy', 'Advocacy', 'Departments')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  admin_notes TEXT
);

-- Enable Row Level Security
ALTER TABLE public.submitted_prompts ENABLE ROW LEVEL SECURITY;

-- Users can insert their own prompts
CREATE POLICY "Users can insert own prompts"
  ON public.submitted_prompts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own prompts
CREATE POLICY "Users can view own prompts"
  ON public.submitted_prompts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all prompts
CREATE POLICY "Admins can view all prompts"
  ON public.submitted_prompts
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'brendan.stanton@gmail.com'
  );

-- Admins can update all prompts (for review)
CREATE POLICY "Admins can update all prompts"
  ON public.submitted_prompts
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'brendan.stanton@gmail.com'
  )
  WITH CHECK (
    auth.jwt() ->> 'email' = 'brendan.stanton@gmail.com'
  );

-- Indexes for common queries
CREATE INDEX idx_submitted_prompts_user_id ON public.submitted_prompts(user_id);
CREATE INDEX idx_submitted_prompts_status ON public.submitted_prompts(status);
CREATE INDEX idx_submitted_prompts_created_at ON public.submitted_prompts(created_at DESC);
CREATE INDEX idx_submitted_prompts_category ON public.submitted_prompts(category);
