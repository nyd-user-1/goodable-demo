-- Create a table for user bill reviews (support/oppose/neutral + notes)
CREATE TABLE public.user_bill_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bill_id BIGINT NOT NULL,
  review_status TEXT CHECK (review_status IN ('support', 'oppose', 'neutral')),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, bill_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_bill_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for user bill reviews
CREATE POLICY "Users can view their own bill reviews"
ON public.user_bill_reviews
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bill reviews"
ON public.user_bill_reviews
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bill reviews"
ON public.user_bill_reviews
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bill reviews"
ON public.user_bill_reviews
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_bill_reviews_updated_at
BEFORE UPDATE ON public.user_bill_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
