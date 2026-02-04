-- Track how many times each prompt card has been clicked to start a chat
CREATE TABLE IF NOT EXISTS prompt_chat_counts (
  prompt_id TEXT PRIMARY KEY,
  chat_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow anyone to read counts (public page)
ALTER TABLE prompt_chat_counts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view prompt chat counts" ON prompt_chat_counts
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert prompt chat counts" ON prompt_chat_counts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update prompt chat counts" ON prompt_chat_counts
  FOR UPDATE USING (true);

-- Atomic increment function: upserts with a seed value on first call
CREATE OR REPLACE FUNCTION increment_prompt_chat_count(p_prompt_id TEXT, p_seed_count INTEGER DEFAULT 0)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO prompt_chat_counts (prompt_id, chat_count, updated_at)
  VALUES (p_prompt_id, p_seed_count + 1, NOW())
  ON CONFLICT (prompt_id)
  DO UPDATE SET chat_count = prompt_chat_counts.chat_count + 1,
               updated_at = NOW();
END;
$$;
