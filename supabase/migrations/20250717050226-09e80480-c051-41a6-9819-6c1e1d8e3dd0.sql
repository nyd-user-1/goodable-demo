
-- Create visitor_counts table to track daily visitor counts
CREATE TABLE public.visitor_counts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (though this will be publicly readable)
ALTER TABLE public.visitor_counts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read visitor counts
CREATE POLICY "Allow public read access to visitor counts"
  ON public.visitor_counts
  FOR SELECT
  USING (true);

-- Create policy to allow the edge function to insert/update visitor counts
CREATE POLICY "Allow service role to manage visitor counts"
  ON public.visitor_counts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to increment visitor count for today
CREATE OR REPLACE FUNCTION public.increment_visitor_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  current_count INTEGER;
BEGIN
  -- Insert or update the count for today
  INSERT INTO public.visitor_counts (date, count)
  VALUES (today_date, 1)
  ON CONFLICT (date)
  DO UPDATE SET 
    count = visitor_counts.count + 1,
    updated_at = now();
  
  -- Return the current count
  SELECT count INTO current_count
  FROM public.visitor_counts
  WHERE date = today_date;
  
  RETURN current_count;
END;
$$;

-- Insert initial data for today if it doesn't exist
INSERT INTO public.visitor_counts (date, count)
VALUES (CURRENT_DATE, 84)
ON CONFLICT (date) DO NOTHING;
