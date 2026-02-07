-- Add full-text search support for chat_sessions and chat_notes
-- This enables server-side indexed search instead of client-side filtering

-- 1. Add tsvector columns for full-text search
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE chat_notes ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 2. Create GIN indexes for fast full-text search
CREATE INDEX IF NOT EXISTS idx_chat_sessions_search ON chat_sessions USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_chat_notes_search ON chat_notes USING GIN (search_vector);

-- 3. Create index on updated_at for cursor-based pagination
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_notes_updated_at ON chat_notes (updated_at DESC);

-- 4. Function to update chat_sessions search vector
CREATE OR REPLACE FUNCTION update_chat_sessions_search_vector()
RETURNS TRIGGER AS $$
DECLARE
  first_user_message TEXT;
BEGIN
  -- Extract first user message from messages JSON array (only if messages is a valid array)
  IF NEW.messages IS NOT NULL AND jsonb_typeof(NEW.messages::jsonb) = 'array' THEN
    SELECT msg->>'content' INTO first_user_message
    FROM jsonb_array_elements(NEW.messages::jsonb) AS msg
    WHERE msg->>'role' = 'user'
    LIMIT 1;
  END IF;

  -- Combine title and first user message for search
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(first_user_message, '')), 'B');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Function to update chat_notes search vector
CREATE OR REPLACE FUNCTION update_chat_notes_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  -- Combine title, content, and user_query for search
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.user_query, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create triggers to auto-update search vectors
DROP TRIGGER IF EXISTS trigger_chat_sessions_search_vector ON chat_sessions;
CREATE TRIGGER trigger_chat_sessions_search_vector
  BEFORE INSERT OR UPDATE OF title, messages ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_sessions_search_vector();

DROP TRIGGER IF EXISTS trigger_chat_notes_search_vector ON chat_notes;
CREATE TRIGGER trigger_chat_notes_search_vector
  BEFORE INSERT OR UPDATE OF title, content, user_query ON chat_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_notes_search_vector();

-- 7. Backfill existing records
UPDATE chat_sessions SET title = title WHERE search_vector IS NULL;
UPDATE chat_notes SET title = title WHERE search_vector IS NULL;
