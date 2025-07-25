-- Quick script to create problem_cards table and map to policy data
-- Run this in Supabase SQL Editor after importing the Top 50 Public Policy Problems data

-- Create the problem_cards table
CREATE TABLE IF NOT EXISTS public.problem_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  sub_problems INTEGER DEFAULT 0,
  solutions INTEGER DEFAULT 0,
  policy_data_title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.problem_cards ENABLE ROW LEVEL SECURITY;

-- Create read policy
CREATE POLICY "Problem cards are viewable by everyone" 
ON public.problem_cards 
FOR SELECT 
USING (true);

-- Insert mappings for key problems
INSERT INTO public.problem_cards (slug, title, category, sub_problems, solutions, policy_data_title)
VALUES
  ('addictive-technology', 'Addictive Technology', 'Technology', 5, 8, 'Addictive Tech: Redesigning for Human Wellbeing'),
  ('healthcare-access', 'Healthcare Access', 'Healthcare', 20, 52, 'Healthcare Access: Bridging the Coverage Gap'),
  ('housing-crisis', 'Housing Crisis', 'Housing', 18, 45, 'Housing Crisis: Keeping Communities Together'),
  ('income-stagnation', 'Income Stagnation', 'Economic Policy', 16, 32, 'Income Stagnation: The Squeeze on Working Americans'),
  ('mental-health', 'Mental Health Support', 'Healthcare', 12, 38, 'Mental Health Support: Bridging the Care Divide')
ON CONFLICT (slug) DO NOTHING;

-- Verify the mapping works
SELECT 
  pc.title as card_title,
  pc.policy_data_title,
  pp."Title" as policy_title,
  pp."Why This Matters Now" as why_matters
FROM problem_cards pc
LEFT JOIN "Top 50 Public Policy Problems" pp 
  ON pc.policy_data_title = pp."Title"
LIMIT 5;