-- Update the check constraint to include 'generating' state
ALTER TABLE public.problem_chats DROP CONSTRAINT valid_current_state;

ALTER TABLE public.problem_chats ADD CONSTRAINT valid_current_state 
CHECK (current_state = ANY (ARRAY['Problem Identified'::text, 'generating'::text, 'Policy Development'::text, 'Policy Submission'::text, 'Public Gallery'::text]));