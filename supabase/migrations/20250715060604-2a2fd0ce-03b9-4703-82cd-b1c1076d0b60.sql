-- Add a new UUID primary key column
ALTER TABLE public."Persona" DROP CONSTRAINT "Persona_pkey";
ALTER TABLE public."Persona" ADD COLUMN id UUID DEFAULT gen_random_uuid();
ALTER TABLE public."Persona" ADD PRIMARY KEY (id);

-- Create an index on act for performance
CREATE INDEX idx_persona_act ON public."Persona" (act);