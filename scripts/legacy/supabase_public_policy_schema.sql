-- Create table for public policy proposals
CREATE TABLE IF NOT EXISTS public_policy_proposals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES auth.users(id),
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
    user_id UUID NOT NULL REFERENCES auth.users(id),
    vote_type TEXT CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(proposal_id, user_id)
);

-- Create table for comments
CREATE TABLE IF NOT EXISTS public_policy_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    proposal_id UUID REFERENCES public_policy_proposals(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id),
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_proposals_published_at ON public_policy_proposals(published_at DESC);
CREATE INDEX idx_votes_proposal_id ON public_policy_votes(proposal_id);
CREATE INDEX idx_votes_user_id ON public_policy_votes(user_id);
CREATE INDEX idx_comments_proposal_id ON public_policy_comments(proposal_id);

-- Create materialized view for proposals with vote counts and author info
CREATE MATERIALIZED VIEW IF NOT EXISTS public_policy_proposals_with_stats AS
SELECT 
    p.*,
    pr.username as author_name,
    pr.avatar_url as author_avatar,
    COALESCE(COUNT(DISTINCT v_up.id), 0) as up_votes,
    COALESCE(COUNT(DISTINCT v_down.id), 0) as down_votes,
    COALESCE(COUNT(DISTINCT v_up.id), 0) - COALESCE(COUNT(DISTINCT v_down.id), 0) as total_score,
    COALESCE(COUNT(DISTINCT c.id), 0) as comment_count
FROM public_policy_proposals p
LEFT JOIN profiles pr ON p.author_id = pr.id
LEFT JOIN public_policy_votes v_up ON p.id = v_up.proposal_id AND v_up.vote_type = 'up'
LEFT JOIN public_policy_votes v_down ON p.id = v_down.proposal_id AND v_down.vote_type = 'down'
LEFT JOIN public_policy_comments c ON p.id = c.proposal_id
GROUP BY p.id, pr.username, pr.avatar_url;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX idx_proposals_stats_id ON public_policy_proposals_with_stats(id);

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_public_policy_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public_policy_proposals_with_stats;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to refresh stats periodically (can be called via cron job or after writes)
-- Note: Supabase doesn't support automatic triggers for materialized view refresh
-- You'll need to call refresh_public_policy_stats() manually or via edge function

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

-- Create trigger for updating timestamps (using existing function)
CREATE TRIGGER update_public_policy_proposals_updated_at 
    BEFORE UPDATE ON public_policy_proposals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create view for comments with author info (for easy querying)
CREATE OR REPLACE VIEW public_policy_comments_with_authors AS
SELECT 
    c.*,
    pr.username as author_name,
    pr.avatar_url as author_avatar
FROM public_policy_comments c
LEFT JOIN profiles pr ON c.author_id = pr.id;

-- Grant necessary permissions on views
GRANT SELECT ON public_policy_proposals_with_stats TO authenticated, anon;
GRANT SELECT ON public_policy_comments_with_authors TO authenticated, anon;

-- Sample data migration query (to migrate existing localStorage data)
-- This should be run after the schema is created, with actual data from localStorage
/*
-- First, ensure you have user profiles for the authors
-- Then insert proposals:
INSERT INTO public_policy_proposals (
    title, content, author_id, published_at, category, problem, status
) VALUES 
    -- Add your existing proposals here
    -- Example:
    -- ('Universal Basic Income Implementation', 
    --  'Content here...', 
    --  (SELECT id FROM auth.users WHERE email = 'user@example.com'), 
    --  '2024-01-15T10:00:00Z', 'Economic Policy', 'Income Inequality', 'published')
;

-- After inserting data, refresh the materialized view:
SELECT refresh_public_policy_stats();
*/