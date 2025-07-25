-- Create waitlist table for email signups
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    source TEXT DEFAULT 'landing_page',
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON public.waitlist(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts (for waitlist signups)
CREATE POLICY "Anyone can join waitlist" ON public.waitlist
    FOR INSERT 
    TO public
    WITH CHECK (true);

-- Create policy to allow admins to view all waitlist entries
CREATE POLICY "Admins can view waitlist" ON public.waitlist
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create policy to allow users to check if their email exists
CREATE POLICY "Users can check their own email" ON public.waitlist
    FOR SELECT
    TO public
    USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Add table comment
COMMENT ON TABLE public.waitlist IS 'Stores email addresses for the product waitlist';
COMMENT ON COLUMN public.waitlist.email IS 'Email address of the person joining the waitlist';
COMMENT ON COLUMN public.waitlist.source IS 'Where the signup came from (e.g., landing_page, blog, etc.)';
COMMENT ON COLUMN public.waitlist.metadata IS 'Additional data about the signup (referrer, utm params, etc.)';