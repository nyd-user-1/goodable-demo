-- RPC functions for server-side search with cursor-based pagination
-- Returns results ordered by relevance (when searching) or last_activity (when browsing)

-- Type for search results
DROP TYPE IF EXISTS search_result CASCADE;
CREATE TYPE search_result AS (
  id UUID,
  type TEXT,
  title TEXT,
  preview_text TEXT,
  created_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  relevance REAL
);

-- 1. Search chats with full-text search and cursor pagination
CREATE OR REPLACE FUNCTION search_chats(
  p_user_id UUID,
  p_query TEXT DEFAULT NULL,
  p_cursor TIMESTAMPTZ DEFAULT NULL,
  p_limit INT DEFAULT 20
)
RETURNS SETOF search_result
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  search_query tsquery;
BEGIN
  -- Build search query if provided
  IF p_query IS NOT NULL AND p_query != '' THEN
    search_query := plainto_tsquery('english', p_query);

    RETURN QUERY
    SELECT
      cs.id,
      'chat'::TEXT AS type,
      cs.title,
      -- Extract first user message as preview
      (SELECT msg->>'content' FROM jsonb_array_elements(cs.messages::jsonb) AS msg
       WHERE msg->>'role' = 'user' LIMIT 1)::TEXT AS preview_text,
      cs.created_at,
      cs.updated_at AS last_activity_at,
      ts_rank(cs.search_vector, search_query) AS relevance
    FROM chat_sessions cs
    WHERE cs.user_id = p_user_id
      AND cs.search_vector @@ search_query
      AND (p_cursor IS NULL OR cs.updated_at < p_cursor)
    ORDER BY ts_rank(cs.search_vector, search_query) DESC, cs.updated_at DESC
    LIMIT p_limit;
  ELSE
    -- Browse mode: return recent chats
    RETURN QUERY
    SELECT
      cs.id,
      'chat'::TEXT AS type,
      cs.title,
      (SELECT msg->>'content' FROM jsonb_array_elements(cs.messages::jsonb) AS msg
       WHERE msg->>'role' = 'user' LIMIT 1)::TEXT AS preview_text,
      cs.created_at,
      cs.updated_at AS last_activity_at,
      1.0::REAL AS relevance
    FROM chat_sessions cs
    WHERE cs.user_id = p_user_id
      AND (p_cursor IS NULL OR cs.updated_at < p_cursor)
    ORDER BY cs.updated_at DESC
    LIMIT p_limit;
  END IF;
END;
$$;

-- 2. Search notes with full-text search and cursor pagination
CREATE OR REPLACE FUNCTION search_notes(
  p_user_id UUID,
  p_query TEXT DEFAULT NULL,
  p_cursor TIMESTAMPTZ DEFAULT NULL,
  p_limit INT DEFAULT 20
)
RETURNS SETOF search_result
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  search_query tsquery;
BEGIN
  IF p_query IS NOT NULL AND p_query != '' THEN
    search_query := plainto_tsquery('english', p_query);

    RETURN QUERY
    SELECT
      cn.id,
      'note'::TEXT AS type,
      cn.title,
      COALESCE(cn.snippet, LEFT(cn.content, 200)) AS preview_text,
      cn.created_at,
      cn.updated_at AS last_activity_at,
      ts_rank(cn.search_vector, search_query) AS relevance
    FROM chat_notes cn
    WHERE cn.user_id = p_user_id
      AND cn.search_vector @@ search_query
      AND (p_cursor IS NULL OR cn.updated_at < p_cursor)
    ORDER BY ts_rank(cn.search_vector, search_query) DESC, cn.updated_at DESC
    LIMIT p_limit;
  ELSE
    RETURN QUERY
    SELECT
      cn.id,
      'note'::TEXT AS type,
      cn.title,
      COALESCE(cn.snippet, LEFT(cn.content, 200)) AS preview_text,
      cn.created_at,
      cn.updated_at AS last_activity_at,
      1.0::REAL AS relevance
    FROM chat_notes cn
    WHERE cn.user_id = p_user_id
      AND (p_cursor IS NULL OR cn.updated_at < p_cursor)
    ORDER BY cn.updated_at DESC
    LIMIT p_limit;
  END IF;
END;
$$;

-- 3. Combined search across chats and notes (for All tab)
CREATE OR REPLACE FUNCTION search_all(
  p_user_id UUID,
  p_query TEXT DEFAULT NULL,
  p_cursor TIMESTAMPTZ DEFAULT NULL,
  p_limit INT DEFAULT 20
)
RETURNS SETOF search_result
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_query IS NOT NULL AND p_query != '' THEN
    -- Search mode: combine and rank by relevance
    RETURN QUERY
    SELECT * FROM (
      SELECT * FROM search_chats(p_user_id, p_query, p_cursor, p_limit)
      UNION ALL
      SELECT * FROM search_notes(p_user_id, p_query, p_cursor, p_limit)
    ) combined
    ORDER BY relevance DESC, last_activity_at DESC
    LIMIT p_limit;
  ELSE
    -- Browse mode: interleave by last_activity_at
    RETURN QUERY
    SELECT * FROM (
      SELECT * FROM search_chats(p_user_id, NULL, p_cursor, p_limit)
      UNION ALL
      SELECT * FROM search_notes(p_user_id, NULL, p_cursor, p_limit)
    ) combined
    ORDER BY last_activity_at DESC
    LIMIT p_limit;
  END IF;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION search_chats TO authenticated;
GRANT EXECUTE ON FUNCTION search_notes TO authenticated;
GRANT EXECUTE ON FUNCTION search_all TO authenticated;
