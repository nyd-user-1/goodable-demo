-- This script verifies that all blog-related tables and relationships are properly set up

-- Check if all required tables exist
SELECT 
    'blog_proposals' as table_name,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'blog_proposals'
    ) as exists
UNION ALL
SELECT 
    'blog_votes' as table_name,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'blog_votes'
    ) as exists
UNION ALL
SELECT 
    'blog_comments' as table_name,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'blog_comments'
    ) as exists
UNION ALL
SELECT 
    'profiles' as table_name,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
    ) as exists
UNION ALL
SELECT 
    'waitlist' as table_name,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'waitlist'
    ) as exists;

-- Check if views exist
SELECT 
    'blog_proposal_stats' as view_name,
    EXISTS (
        SELECT FROM information_schema.views 
        WHERE table_schema = 'public' 
        AND table_name = 'blog_proposal_stats'
    ) as exists
UNION ALL
SELECT 
    'blog_comments_with_authors' as view_name,
    EXISTS (
        SELECT FROM information_schema.views 
        WHERE table_schema = 'public' 
        AND table_name = 'blog_comments_with_authors'
    ) as exists;

-- Check foreign key relationships
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('blog_proposals', 'blog_votes', 'blog_comments')
ORDER BY tc.table_name;

-- Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('blog_proposals', 'blog_votes', 'blog_comments', 'waitlist')
ORDER BY tablename;

-- Count policies per table
SELECT 
    schemaname,
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN ('blog_proposals', 'blog_votes', 'blog_comments', 'waitlist')
GROUP BY schemaname, tablename
ORDER BY tablename;