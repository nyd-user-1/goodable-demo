-- Create problem chat rooms table
CREATE TABLE IF NOT EXISTS problem_chat_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create problem chat messages table
CREATE TABLE IF NOT EXISTS problem_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_id TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'message' CHECK (type IN ('message', 'join', 'leave', 'system')),
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_problem_chat_rooms_problem_id ON problem_chat_rooms(problem_id);
CREATE INDEX IF NOT EXISTS idx_problem_chat_messages_problem_id ON problem_chat_messages(problem_id);
CREATE INDEX IF NOT EXISTS idx_problem_chat_messages_author_id ON problem_chat_messages(author_id);
CREATE INDEX IF NOT EXISTS idx_problem_chat_messages_created_at ON problem_chat_messages(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE problem_chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for problem_chat_rooms
CREATE POLICY "Anyone can view problem chat rooms" ON problem_chat_rooms
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create chat rooms" ON problem_chat_rooms
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for problem_chat_messages
CREATE POLICY "Anyone can view problem chat messages" ON problem_chat_messages
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create messages" ON problem_chat_messages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);

CREATE POLICY "Users can update their own messages" ON problem_chat_messages
  FOR UPDATE USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete their own messages" ON problem_chat_messages
  FOR DELETE USING (auth.uid() = author_id);

-- Create function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_problem_chat_rooms_updated_at BEFORE UPDATE ON problem_chat_rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_problem_chat_messages_updated_at BEFORE UPDATE ON problem_chat_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a helper function for creating tables (for fallback in component)
CREATE OR REPLACE FUNCTION create_problem_chat_tables()
RETURNS VOID AS $$
BEGIN
  -- This function ensures tables exist (already created above)
  -- Just a placeholder for the component fallback
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;