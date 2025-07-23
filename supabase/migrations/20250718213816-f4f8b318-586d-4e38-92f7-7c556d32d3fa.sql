-- Enable public read access to Sample Problems table
CREATE POLICY "Enable read access for all users on Sample Problems" 
ON "Sample Problems" 
FOR SELECT 
USING (true);