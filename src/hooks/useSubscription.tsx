import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string;
  subscription_end: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: 'free',
    subscription_end: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSubscription = async () => {
    if (!user) {
      setSubscription({
        subscribed: false,
        subscription_tier: 'free',
        subscription_end: null
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: functionError } = await supabase.functions.invoke('check-subscription');
      
      if (functionError) {
        throw functionError;
      }

      if (data) {
        setSubscription(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check subscription');
    } finally {
      setLoading(false);
    }
  };

  const createCheckout = async (tier: string, billingCycle: 'monthly' | 'annually' = 'monthly') => {
    if (!user) {
      throw new Error('User must be authenticated to create checkout');
    }

    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { tier, billingCycle }
    });

    if (error) {
      throw error;
    }

    if (data?.url) {
      // Check if we're on a mobile device or if popup would be blocked
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // On mobile, redirect in the same tab for better compatibility
        window.location.href = data.url;
      } else {
        // On desktop, try to open in new tab, with fallback to same tab
        const newWindow = window.open(data.url, '_blank');
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          // Popup blocked, fallback to same tab
          window.location.href = data.url;
        }
      }
    }
  };

  const openCustomerPortal = async () => {
    if (!user) {
      throw new Error('User must be authenticated to access customer portal');
    }

    const { data, error } = await supabase.functions.invoke('customer-portal');

    if (error) {
      throw error;
    }

    if (data?.url) {
      window.open(data.url, '_blank');
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [user]);

  return {
    subscription,
    loading,
    error,
    checkSubscription,
    createCheckout,
    openCustomerPortal
  };
};