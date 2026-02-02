import { useState } from 'react';
import { SubscriptionTierCard } from './SubscriptionTierCard';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const subscriptionTiers = [
  {
    tier: 'free',
    name: 'Citizen',
    monthlyPrice: '$0',
    annualPrice: '$0',
    description: 'Perfect for getting started',
    features: [
      'Bills — browse and search legislation',
      'Members — view elected officials',
      '2,000 AI words per day',
      'Basic search functionality'
    ]
  },
  {
    tier: 'staffer',
    name: 'Staffer',
    monthlyPrice: '$99',
    annualPrice: '$82.50',
    description: 'Built for legislative staff',
    features: [
      'Everything in Citizen, plus:',
      'Committees — track agendas & hearings',
      'Departments — explore NYS agencies',
      'School Funding — district-level data',
      '5,000 AI words per day'
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
      'Everything in Staffer, plus:',
      'Explorer — interactive budget dashboard',
      'Export capabilities (PDF, CSV)',
      '5,000 AI words per day'
    ]
  },
  {
    tier: 'professional',
    name: 'Professional',
    monthlyPrice: '$299',
    annualPrice: '$249.17',
    description: 'For advocates and consultants',
    features: [
      'Everything in Researcher, plus:',
      'Budget — full NYS budget data',
      'Contracts — government vendor search',
      'Lobbying — lobbyist & client data',
      'Unlimited AI words'
    ]
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: '$499',
    annualPrice: '$415.83',
    description: 'Comprehensive solution for organizations',
    features: [
      'Everything in Professional, plus:',
      'Multi-user management',
      'Custom workflows & integrations',
      'Dedicated account manager',
      'Unlimited AI words'
    ]
  }
];

const getTierDisplayName = (tier: string) => {
  const tierNames: Record<string, string> = {
    free: 'Citizen',
    staffer: 'Staffer',
    researcher: 'Researcher',
    professional: 'Professional',
    enterprise: 'Enterprise',
    government: 'Government'
  };
  return tierNames[tier] || tier;
};

export const ProfileSubscriptionPlans = () => {
  const { subscription, loading, checkSubscription, createCheckout } = useSubscription();
  const { user } = useAuth();
  const { toast } = useToast();
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

  // Get username from user profile or email
  const getDisplayName = () => {
    if (user?.user_metadata?.username) return user.user_metadata.username;
    if (user?.user_metadata?.display_name) return user.user_metadata.display_name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-96 bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {getDisplayName()}, you are on the {getTierDisplayName(subscription.subscription_tier)} plan
          </h2>
          {subscription.subscription_end && (
            <p className="text-muted-foreground">
              Expires: {new Date(subscription.subscription_end).toLocaleDateString()}
            </p>
          )}
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Status
        </Button>
      </div>

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