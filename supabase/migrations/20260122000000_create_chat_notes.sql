-- Create chat_notes table for "Open as Note" feature
-- This stores chat responses that users want to save as standalone notes

CREATE TABLE IF NOT EXISTS chat_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_session_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_query TEXT,
  bill_id BIGINT REFERENCES "Bills"(bill_id) ON DELETE SET NULL,
  member_id BIGINT REFERENCES "People"(people_id) ON DELETE SET NULL,
  committee_id BIGINT REFERENCES "Committees"(committee_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE chat_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own notes
CREATE POLICY "Users can manage own notes" ON chat_notes
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_chat_notes_user_id ON chat_notes(user_id);
CREATE INDEX idx_chat_notes_created_at ON chat_notes(created_at DESC);

-- Auto-update timestamp trigger (reuse existing function if available)
CREATE OR REPLACE FUNCTION update_chat_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chat_notes_updated_at
  BEFORE UPDATE ON chat_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_notes_updated_at();
