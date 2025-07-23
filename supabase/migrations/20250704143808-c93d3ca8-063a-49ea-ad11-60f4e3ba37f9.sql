-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create problem statements table
CREATE TABLE public.problem_statements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on problem_statements
ALTER TABLE public.problem_statements ENABLE ROW LEVEL SECURITY;

-- Create policies for problem_statements
CREATE POLICY "Users can view their own problem statements" 
ON public.problem_statements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own problem statements" 
ON public.problem_statements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own problem statements" 
ON public.problem_statements 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own problem statements" 
ON public.problem_statements 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create legislative ideas table
CREATE TABLE public.legislative_ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  problem_statement_id UUID REFERENCES public.problem_statements(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  original_idea TEXT NOT NULL,
  improved_idea TEXT,
  category TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on legislative_ideas
ALTER TABLE public.legislative_ideas ENABLE ROW LEVEL SECURITY;

-- Create policies for legislative_ideas
CREATE POLICY "Users can view their own legislative ideas" 
ON public.legislative_ideas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own legislative ideas" 
ON public.legislative_ideas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own legislative ideas" 
ON public.legislative_ideas 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own legislative ideas" 
ON public.legislative_ideas 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create drafts table
CREATE TABLE public.legislative_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  legislative_idea_id UUID REFERENCES public.legislative_ideas(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT,
  draft_content TEXT NOT NULL,
  analysis JSONB,
  votes JSONB DEFAULT '{"rating": 0, "totalVotes": 0, "starCounts": [0, 0, 0, 0, 0]}',
  is_public BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on legislative_drafts
ALTER TABLE public.legislative_drafts ENABLE ROW LEVEL SECURITY;

-- Create policies for legislative_drafts
CREATE POLICY "Users can view their own drafts" 
ON public.legislative_drafts 
FOR SELECT 
USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own drafts" 
ON public.legislative_drafts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drafts" 
ON public.legislative_drafts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own drafts" 
ON public.legislative_drafts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_problem_statements_updated_at
  BEFORE UPDATE ON public.problem_statements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_legislative_ideas_updated_at
  BEFORE UPDATE ON public.legislative_ideas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_legislative_drafts_updated_at
  BEFORE UPDATE ON public.legislative_drafts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();