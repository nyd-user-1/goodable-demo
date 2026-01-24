-- Create feedback table for capturing user feedback
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    page_url TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'resolved', 'dismissed')),
    notes TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add comment to table
COMMENT ON TABLE public.feedback IS 'User feedback submissions from the application';

-- Add comments to columns
COMMENT ON COLUMN public.feedback.id IS 'Unique identifier for the feedback';
COMMENT ON COLUMN public.feedback.user_id IS 'Reference to the user who submitted the feedback (nullable for anonymous)';
COMMENT ON COLUMN public.feedback.content IS 'The feedback content/message';
COMMENT ON COLUMN public.feedback.page_url IS 'The page URL where feedback was submitted from';
COMMENT ON COLUMN public.feedback.user_agent IS 'Browser user agent string';
COMMENT ON COLUMN public.feedback.created_at IS 'Timestamp when feedback was submitted';
COMMENT ON COLUMN public.feedback.status IS 'Current status of the feedback (new, reviewed, resolved, dismissed)';
COMMENT ON COLUMN public.feedback.notes IS 'Internal notes from reviewers';
COMMENT ON COLUMN public.feedback.reviewed_at IS 'Timestamp when feedback was reviewed';
COMMENT ON COLUMN public.feedback.reviewed_by IS 'Reference to the admin who reviewed the feedback';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own feedback
CREATE POLICY "Users can insert own feedback" ON public.feedback
    FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Users can view their own feedback
CREATE POLICY "Users can view own feedback" ON public.feedback
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Admins can view all feedback (assuming admin check via function or role)
-- Note: You may need to adjust this based on your admin identification method
CREATE POLICY "Admins can view all feedback" ON public.feedback
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Policy: Admins can update feedback status
CREATE POLICY "Admins can update feedback" ON public.feedback
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );
