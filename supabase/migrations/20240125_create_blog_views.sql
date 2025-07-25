-- Create view for blog proposals with statistics
CREATE OR REPLACE VIEW public.blog_proposal_stats AS
SELECT 
    bp.*,
    p.display_name as author_name,
    p.username as author_username,
    p.avatar_url as author_avatar,
    COALESCE(vote_counts.up_votes, 0) as up_votes,
    COALESCE(vote_counts.down_votes, 0) as down_votes,
    COALESCE(vote_counts.total_score, 0) as total_score,
    COALESCE(comment_count.count, 0) as comment_count
FROM 
    public.blog_proposals bp
LEFT JOIN 
    public.profiles p ON bp.author_id = p.id
LEFT JOIN (
    SELECT 
        proposal_id,
        COUNT(CASE WHEN vote_type = 'upvote' THEN 1 END) as up_votes,
        COUNT(CASE WHEN vote_type = 'downvote' THEN 1 END) as down_votes,
        COUNT(CASE WHEN vote_type = 'upvote' THEN 1 END) - 
        COUNT(CASE WHEN vote_type = 'downvote' THEN 1 END) as total_score
    FROM 
        public.blog_votes
    GROUP BY 
        proposal_id
) vote_counts ON bp.id = vote_counts.proposal_id
LEFT JOIN (
    SELECT 
        proposal_id,
        COUNT(*) as count
    FROM 
        public.blog_comments
    GROUP BY 
        proposal_id
) comment_count ON bp.id = comment_count.proposal_id;

-- Create view for blog comments with author information
CREATE OR REPLACE VIEW public.blog_comments_with_authors AS
SELECT 
    bc.*,
    p.display_name as author_name,
    p.username as author_username,
    p.avatar_url as author_avatar
FROM 
    public.blog_comments bc
LEFT JOIN 
    public.profiles p ON bc.author_id = p.id;

-- Grant permissions on views
GRANT SELECT ON public.blog_proposal_stats TO anon, authenticated;
GRANT SELECT ON public.blog_comments_with_authors TO anon, authenticated;

-- Add comments for documentation
COMMENT ON VIEW public.blog_proposal_stats IS 'Blog proposals with vote counts, comment counts, and author information';
COMMENT ON VIEW public.blog_comments_with_authors IS 'Blog comments with author profile information';