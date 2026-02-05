-- Add url column and relax prompt/category constraints for card-based submissions
ALTER TABLE public.submitted_prompts
  ADD COLUMN url TEXT NOT NULL DEFAULT '';

-- Make prompt nullable (auto-generated from title)
ALTER TABLE public.submitted_prompts
  ALTER COLUMN prompt DROP NOT NULL;

-- Make category nullable (optional for user submissions)
ALTER TABLE public.submitted_prompts
  DROP CONSTRAINT IF EXISTS submitted_prompts_category_check;

ALTER TABLE public.submitted_prompts
  ALTER COLUMN category DROP NOT NULL;

-- Re-add category check allowing NULL
ALTER TABLE public.submitted_prompts
  ADD CONSTRAINT submitted_prompts_category_check
  CHECK (category IS NULL OR category IN ('Bills', 'Policy', 'Advocacy', 'Departments'));
