-- Create table for public policy proposals
CREATE TABLE IF NOT EXISTS public_policy_proposals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    author_role TEXT DEFAULT 'Member',
    author_id UUID REFERENCES auth.users(id),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    category TEXT NOT NULL,
    problem TEXT NOT NULL,
    status TEXT DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for votes
CREATE TABLE IF NOT EXISTS public_policy_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    proposal_id UUID REFERENCES public_policy_proposals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    vote_type TEXT CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(proposal_id, user_id)
);

-- Create table for comments
CREATE TABLE IF NOT EXISTS public_policy_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    proposal_id UUID REFERENCES public_policy_proposals(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    author_role TEXT DEFAULT 'Member',
    author_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_proposals_published_at ON public_policy_proposals(published_at DESC);
CREATE INDEX idx_votes_proposal_id ON public_policy_votes(proposal_id);
CREATE INDEX idx_votes_user_id ON public_policy_votes(user_id);
CREATE INDEX idx_comments_proposal_id ON public_policy_comments(proposal_id);

-- Create view for proposals with vote counts
CREATE OR REPLACE VIEW public_policy_proposals_with_stats AS
SELECT 
    p.*,
    COALESCE(COUNT(DISTINCT v_up.id), 0) as up_votes,
    COALESCE(COUNT(DISTINCT v_down.id), 0) as down_votes,
    COALESCE(COUNT(DISTINCT v_up.id), 0) - COALESCE(COUNT(DISTINCT v_down.id), 0) as total_score,
    COALESCE(COUNT(DISTINCT c.id), 0) as comment_count
FROM public_policy_proposals p
LEFT JOIN public_policy_votes v_up ON p.id = v_up.proposal_id AND v_up.vote_type = 'up'
LEFT JOIN public_policy_votes v_down ON p.id = v_down.proposal_id AND v_down.vote_type = 'down'
LEFT JOIN public_policy_comments c ON p.id = c.proposal_id
GROUP BY p.id;

-- Enable Row Level Security
ALTER TABLE public_policy_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_policy_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_policy_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (anyone can read)
CREATE POLICY "Public policy proposals are viewable by everyone" 
    ON public_policy_proposals FOR SELECT 
    USING (true);

CREATE POLICY "Public policy votes are viewable by everyone" 
    ON public_policy_votes FOR SELECT 
    USING (true);

CREATE POLICY "Public policy comments are viewable by everyone" 
    ON public_policy_comments FOR SELECT 
    USING (true);

-- Create policies for authenticated users (can create and manage their own content)
CREATE POLICY "Authenticated users can create proposals" 
    ON public_policy_proposals FOR INSERT 
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own proposals" 
    ON public_policy_proposals FOR UPDATE 
    USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own proposals" 
    ON public_policy_proposals FOR DELETE 
    USING (auth.uid() = author_id);

CREATE POLICY "Authenticated users can vote" 
    ON public_policy_votes FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" 
    ON public_policy_votes FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" 
    ON public_policy_votes FOR DELETE 
    USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can comment" 
    ON public_policy_comments FOR INSERT 
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own comments" 
    ON public_policy_comments FOR UPDATE 
    USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments" 
    ON public_policy_comments FOR DELETE 
    USING (auth.uid() = author_id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating timestamps
CREATE TRIGGER update_public_policy_proposals_updated_at 
    BEFORE UPDATE ON public_policy_proposals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Sample data migration query (to migrate existing localStorage data)
-- This should be run after the schema is created, with actual data from localStorage
/*
INSERT INTO public_policy_proposals (
    id, title, content, author_name, author_avatar, author_role, 
    published_at, category, problem, status
) VALUES 
    -- Add your existing proposals here
    -- Example:
    -- ('550e8400-e29b-41d4-a716-446655440001', 'Universal Basic Income Implementation', 
    --  'Content here...', 'John Doe', 'avatar_url', 'Policy Analyst', 
    --  '2024-01-15T10:00:00Z', 'Economic Policy', 'Income Inequality', 'published')
;
*/