-- Create problem votes table for 5-star voting system
CREATE TABLE public.problem_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  problem_id TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, problem_id)
);

-- Enable Row Level Security
ALTER TABLE public.problem_votes ENABLE ROW LEVEL SECURITY;

-- Create policies for problem votes
CREATE POLICY "Users can view all problem votes" 
ON public.problem_votes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own votes" 
ON public.problem_votes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" 
ON public.problem_votes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" 
ON public.problem_votes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create view for vote statistics
CREATE VIEW public.problem_vote_stats AS
SELECT 
  problem_id,
  ROUND(AVG(rating)::NUMERIC, 2) as average_rating,
  COUNT(*) as total_votes
FROM public.problem_votes
GROUP BY problem_id;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_problem_votes_updated_at
BEFORE UPDATE ON public.problem_votes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for performance
CREATE INDEX idx_problem_votes_problem_id ON public.problem_votes(problem_id);
CREATE INDEX idx_problem_votes_user_id ON public.problem_votes(user_id);