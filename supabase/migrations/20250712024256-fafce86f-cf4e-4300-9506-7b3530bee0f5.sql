
-- Create table to track member favorites
CREATE TABLE public.user_member_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  member_id BIGINT REFERENCES public.People(people_id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, member_id)
);

-- Create table to track committee favorites
CREATE TABLE public.user_committee_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  committee_id BIGINT REFERENCES public.Committees(committee_id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, committee_id)
);

-- Add member_id and committee_id columns to chat_sessions for tracking AI chats
ALTER TABLE public.chat_sessions 
ADD COLUMN member_id BIGINT REFERENCES public.People(people_id) ON DELETE SET NULL,
ADD COLUMN committee_id BIGINT REFERENCES public.Committees(committee_id) ON DELETE SET NULL;

-- Enable RLS on new tables
ALTER TABLE public.user_member_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_committee_favorites ENABLE ROW LEVEL SECURITY;

-- RLS policies for member favorites
CREATE POLICY "Users can view their own member favorites" 
  ON public.user_member_favorites 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own member favorites" 
  ON public.user_member_favorites 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own member favorites" 
  ON public.user_member_favorites 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for committee favorites
CREATE POLICY "Users can view their own committee favorites" 
  ON public.user_committee_favorites 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own committee favorites" 
  ON public.user_committee_favorites 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own committee favorites" 
  ON public.user_committee_favorites 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add trigger to update updated_at timestamps
CREATE TRIGGER update_user_member_favorites_updated_at 
  BEFORE UPDATE ON public.user_member_favorites 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_committee_favorites_updated_at 
  BEFORE UPDATE ON public.user_committee_favorites 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
