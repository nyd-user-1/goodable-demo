-- Enable RLS on Persona table
ALTER TABLE public."Persona" ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access for all users to personas
CREATE POLICY "Enable read access for all users on personas" 
ON public."Persona" 
FOR SELECT 
USING (true);