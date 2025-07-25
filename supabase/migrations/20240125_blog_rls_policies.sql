-- Enable RLS on blog tables if not already enabled
ALTER TABLE public.blog_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view published proposals" ON public.blog_proposals;
DROP POLICY IF EXISTS "Authenticated users can create proposals" ON public.blog_proposals;
DROP POLICY IF EXISTS "Users can update own proposals" ON public.blog_proposals;
DROP POLICY IF EXISTS "Users can delete own proposals" ON public.blog_proposals;
DROP POLICY IF EXISTS "Anyone can view votes" ON public.blog_votes;
DROP POLICY IF EXISTS "Authenticated users can vote" ON public.blog_votes;
DROP POLICY IF EXISTS "Users can change own votes" ON public.blog_votes;
DROP POLICY IF EXISTS "Anyone can view comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Authenticated users can comment" ON public.blog_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.blog_comments;

-- Blog proposals policies
CREATE POLICY "Anyone can view published proposals" ON public.blog_proposals
    FOR SELECT 
    TO public
    USING (status = 'published' OR author_id = auth.uid());

CREATE POLICY "Authenticated users can create proposals" ON public.blog_proposals
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own proposals" ON public.blog_proposals
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own proposals" ON public.blog_proposals
    FOR DELETE 
    TO authenticated
    USING (auth.uid() = author_id);

-- Blog votes policies
CREATE POLICY "Anyone can view votes" ON public.blog_votes
    FOR SELECT 
    TO public
    USING (true);

CREATE POLICY "Authenticated users can vote" ON public.blog_votes
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = voter_id);

CREATE POLICY "Users can change own votes" ON public.blog_votes
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = voter_id)
    WITH CHECK (auth.uid() = voter_id);

CREATE POLICY "Users can delete own votes" ON public.blog_votes
    FOR DELETE 
    TO authenticated
    USING (auth.uid() = voter_id);

-- Blog comments policies
CREATE POLICY "Anyone can view comments" ON public.blog_comments
    FOR SELECT 
    TO public
    USING (true);

CREATE POLICY "Authenticated users can comment" ON public.blog_comments
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own comments" ON public.blog_comments
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments" ON public.blog_comments
    FOR DELETE 
    TO authenticated
    USING (auth.uid() = author_id);

-- Add policy for admins to manage all content
CREATE POLICY "Admins can manage all proposals" ON public.blog_proposals
    FOR ALL 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Add upsert policy for votes (to handle vote changes)
DROP POLICY IF EXISTS "Users can upsert own votes" ON public.blog_votes;
CREATE POLICY "Users can upsert own votes" ON public.blog_votes
    FOR ALL
    TO authenticated
    USING (auth.uid() = voter_id)
    WITH CHECK (auth.uid() = voter_id);