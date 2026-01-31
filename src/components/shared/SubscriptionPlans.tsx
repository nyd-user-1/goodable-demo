import { useState } from 'react';
import { SubscriptionTierCard } from '../SubscriptionTierCard';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';

export const subscriptionTiers = [
  {
    tier: 'free',
    name: 'Free',
    monthlyPrice: '$0',
    annualPrice: '$0',
    description: 'Perfect for getting started',
    features: [
      'View public bills and legislation',
      'Basic search functionality',
      'Read-only access to committee information',
      'Limited chat sessions (5 per month)'
    ]
  },
  {
    tier: 'student',
    name: 'Citizen',
    monthlyPrice: '$5',
    annualPrice: '$4.17',
    description: 'Designed for engaged citizens',
    features: [
      'All Free features',
      'Unlimited chat sessions',
      'Legislative draft creation (up to 5)',
      'Basic analysis tools',
      'Email support',
      'Civic engagement tools'
    ]
  },
  {
    tier: 'staffer',
    name: 'Staffer',
    monthlyPrice: '$99',
    annualPrice: '$82.50',
    description: 'Built for legislative staff',
    features: [
      'All Student features',
      'Unlimited legislative drafts',
      'Co-authoring capabilities',
      'Advanced bill tracking',
      'Committee agenda access',
      'Priority email support'
    ],
    isPopular: true
  },
  {
    tier: 'researcher',
    name: 'Researcher',
    monthlyPrice: '$149',
    annualPrice: '$124.17',
    description: 'Advanced tools for researchers',
    features: [
      'All Staffer features',
      'Advanced analytics dashboard',
      'Historical data access',
      'Export capabilities (PDF, CSV)',
      'API access (limited)',
      'Research templates'
    ]
  },
  {
    tier: 'professional',
    name: 'Professional',
    monthlyPrice: '$299',
    annualPrice: '$249.17',
    description: 'For professional advocates and consultants',
    features: [
      'All Researcher features',
      'Full API access',
      'Custom integrations',
      'White-label options',
      'Priority support',
      'Advanced collaboration tools'
    ]
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: '$499',
    annualPrice: '$415.83',
    description: 'Comprehensive solution for organizations',
    features: [
      'All Professional features',
      'Multi-user management',
      'Custom workflows',
      'Dedicated account manager',
      'SLA guarantee',
      'Custom training sessions'
    ]
  }
];

interface SubscriptionPlansProps {
  includeAuth?: boolean;
}

export const SubscriptionPlans = ({ includeAuth = false }: SubscriptionPlansProps) => {
  const { subscription, loading, checkSubscription, createCheckout } = useSubscription();
  const { toast } = useToast();
  const auth = includeAuth ? useAuth() : null;
  const [processingTier, setProcessingTier] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);

  const handleTierSelect = async (tier: string) => {
    if (tier === 'free') {
      toast({
        title: "Free Plan",
        description: "You're already on the free plan!",
      });
      return;
    }

    try {
      setProcessingTier(tier);
      await createCheckout(tier, isAnnual ? 'annually' : 'monthly');
      toast({
        title: "Redirecting to Checkout",
        description: "Please complete your subscription in the new tab.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create checkout session",
        variant: "destructive",
      });
    } finally {
      setProcessingTier(null);
    }
  };

  const handleRefresh = async () => {
    await checkSubscription();
    toast({
      title: "Refreshed",
      description: "Subscription status updated",
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center space-x-4">
        <Label htmlFor="billing-toggle" className={!isAnnual ? "font-semibold" : ""}>
          Monthly
        </Label>
        <Switch
          id="billing-toggle"
          checked={isAnnual}
          onCheckedChange={setIsAnnual}
        />
        <Label htmlFor="billing-toggle" className={isAnnual ? "font-semibold" : ""}>
          Annual
          <span className="ml-1 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
            Save 20%
          </span>
        </Label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {subscriptionTiers.map((tierData) => (
          <SubscriptionTierCard
            key={tierData.tier}
            {...tierData}
            price={isAnnual ? tierData.annualPrice : tierData.monthlyPrice}
            billingCycle={isAnnual ? 'annually' : 'monthly'}
            isCurrentTier={subscription.subscription_tier === tierData.tier}
            onSelect={() => handleTierSelect(tierData.tier)}
            disabled={processingTier === tierData.tier}
          />
        ))}
      </div>
    </div>
  );
};