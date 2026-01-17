-- Create chat_excerpts table for storing individual Q&A pairs as bookmarks
CREATE TABLE IF NOT EXISTS chat_excerpts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_session_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  user_message TEXT NOT NULL,
  assistant_message TEXT NOT NULL,
  bill_id BIGINT REFERENCES "Bills"(bill_id) ON DELETE SET NULL,
  member_id BIGINT REFERENCES "People"(people_id) ON DELETE SET NULL,
  committee_id BIGINT REFERENCES "Committees"(committee_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE chat_excerpts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own excerpts
CREATE POLICY "Users can manage own excerpts" ON chat_excerpts
  FOR ALL USING (auth.uid() = user_id);

-- Index for faster queries by user
CREATE INDEX idx_chat_excerpts_user_id ON chat_excerpts(user_id);
CREATE INDEX idx_chat_excerpts_created_at ON chat_excerpts(created_at DESC);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_chat_excerpts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chat_excerpts_updated_at
  BEFORE UPDATE ON chat_excerpts
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_excerpts_updated_at();
