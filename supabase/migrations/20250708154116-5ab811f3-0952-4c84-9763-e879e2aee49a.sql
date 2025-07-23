-- Enable Row Level Security on Committees table
ALTER TABLE public."Committees" ENABLE ROW LEVEL SECURITY;

-- Create policy for read access to all users
CREATE POLICY "Enable read access for all users" ON public."Committees"
FOR SELECT USING (true);