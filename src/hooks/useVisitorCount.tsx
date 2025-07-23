import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useVisitorCount = () => {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const incrementAndGetCount = async () => {
      try {
        setLoading(true);
        
        // Call the edge function to increment the count
        const { data, error } = await supabase.functions.invoke('increment-visitor');
        
        if (error) {
          throw error;
        }
        
        setCount(data.count);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get visitor count');
        // Fallback to a static number if there's an error
        setCount(10000);
      } finally {
        setLoading(false);
      }
    };

    incrementAndGetCount();
  }, []);

  return { count, loading, error };
};