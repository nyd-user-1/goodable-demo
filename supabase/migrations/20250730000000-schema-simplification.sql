-- Schema Simplification Migration
-- Remove unused tables and consolidate chats

-- Step 1: Drop unused tables (safe - not referenced by working pages)
DROP TABLE IF EXISTS co_authors CASCADE;
DROP TABLE IF EXISTS media_outputs CASCADE; 
DROP TABLE IF EXISTS legislative_drafts CASCADE;
DROP TABLE IF EXISTS legislative_ideas CASCADE;

-- Step 2: Enhance chat_sessions to handle all chat types
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS chat_type text DEFAULT 'general';
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS problem_id text;
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS workflow_state text DEFAULT 'active';

-- Step 3: Create index for performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_type ON chat_sessions(chat_type);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_type ON chat_sessions(user_id, chat_type);

-- Step 4: Migrate existing problem_chats data to unified chat_sessions
INSERT INTO chat_sessions (
  user_id,
  title,
  messages,
  chat_type,
  problem_id,
  workflow_state,
  created_at,
  updated_at
)
SELECT 
  pc.user_id,
  pc.title,
  COALESCE(cs.messages, '[]'::jsonb) as messages,
  'problem' as chat_type,
  pc.problem_number as problem_id,
  pc.current_state as workflow_state,
  pc.created_at,
  pc.updated_at
FROM problem_chats pc
LEFT JOIN chat_sessions cs ON pc.chat_session_id = cs.id
ON CONFLICT DO NOTHING;

-- Step 5: Update existing chat_sessions with proper types
UPDATE chat_sessions 
SET chat_type = CASE 
  WHEN bill_id IS NOT NULL THEN 'bill'
  WHEN member_id IS NOT NULL THEN 'member' 
  WHEN committee_id IS NOT NULL THEN 'committee'
  ELSE 'general'
END
WHERE chat_type = 'general';

-- Step 6: Drop problem_chats table (data migrated)
DROP TABLE IF EXISTS problem_chats CASCADE;

-- Step 7: Add RLS policies for new columns
CREATE POLICY "Users can access own chats by type" ON chat_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Step 8: Update blog categories (add constraint for consistency)
ALTER TABLE blog_proposals 
DROP CONSTRAINT IF EXISTS blog_proposals_category_check;

ALTER TABLE blog_proposals
ADD CONSTRAINT blog_proposals_category_check 
CHECK (category IS NULL OR category IN ('problems', 'proposals', 'posts', 'announcements'));

COMMENT ON TABLE chat_sessions IS 'Unified chat table supporting all chat types: general, bill, member, committee, problem';
COMMENT ON COLUMN chat_sessions.chat_type IS 'Type of chat: general, bill, member, committee, problem';
COMMENT ON COLUMN chat_sessions.problem_id IS 'Problem identifier for problem chats';
COMMENT ON COLUMN chat_sessions.workflow_state IS 'Current state for problem workflow chats';