-- Create problem_chats table for landing page chat functionality
CREATE TABLE IF NOT EXISTS public.problem_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  problem_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  current_state TEXT DEFAULT 'draft',
  chat_session_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.problem_chats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for problem_chats
CREATE POLICY "Users can view their own problem chats" 
ON public.problem_chats 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own problem chats" 
ON public.problem_chats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own problem chats" 
ON public.problem_chats 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own problem chats" 
ON public.problem_chats 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create foreign key reference to chat_sessions (optional)
ALTER TABLE public.problem_chats 
ADD CONSTRAINT fk_problem_chats_chat_session 
FOREIGN KEY (chat_session_id) 
REFERENCES public.chat_sessions(id) 
ON DELETE SET NULL;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_problem_chats_updated_at
BEFORE UPDATE ON public.problem_chats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();