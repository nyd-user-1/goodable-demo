-- Add tags and snippet columns to chat_notes table
ALTER TABLE chat_notes ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE chat_notes ADD COLUMN IF NOT EXISTS snippet TEXT DEFAULT '';
