import { useState, useEffect, useCallback, useRef } from 'react';
import { SubscriptionTierCard } from '../SubscriptionTierCard';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { AuthCheckoutModal } from './AuthCheckoutModal';

export const subscriptionTiers = [
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

export const SubscriptionPlans = () => {
  const { subscription, loading, checkSubscription, createCheckout } = useSubscription();
  const { toast } = useToast();
  const { user } = useAuth();
  const [processingTier, setProcessingTier] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingTier, setPendingTier] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Ensure scroll starts at the very beginning on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [loading]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = direction === 'left' ? -container.clientWidth : container.clientWidth;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const performCheckout = useCallback(async (tier: string, billingCycle: 'monthly' | 'annually') => {
    try {
      setProcessingTier(tier);
      await createCheckout(tier, billingCycle);
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
  }, [createCheckout, toast]);

  // Resume checkout after Google OAuth redirect
  useEffect(() => {
    const pending = sessionStorage.getItem('pendingCheckout');
    if (pending && user) {
      sessionStorage.removeItem('pendingCheckout');
      try {
        const { tier, billingCycle } = JSON.parse(pending);
        performCheckout(tier, billingCycle);
      } catch {
        // Invalid sessionStorage data, ignore
      }
    }
  }, [user, performCheckout]);

  const handleTierSelect = async (tier: string) => {
    if (tier === 'free') {
      toast({
        title: "Free Plan",
        description: "You're already on the free plan!",
      });
      return;
    }

    if (!user) {
      setPendingTier(tier);
      setShowAuthModal(true);
      return;
    }

    await performCheckout(tier, isAnnual ? 'annually' : 'monthly');
  };

  const handleAuthenticated = () => {
    setShowAuthModal(false);
    if (pendingTier) {
      performCheckout(pendingTier, isAnnual ? 'annually' : 'monthly');
      setPendingTier(null);
    }
  };

  const handleRefresh = async () => {
    await checkSubscription();
    toast({
      title: "Refreshed",
      description: "Subscription status updated",
    });
  };

  const pendingTierData = pendingTier
    ? subscriptionTiers.find((t) => t.tier === pendingTier)
    : null;

  if (loading) {
    return (
      <div className="scrollbar-none flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-96 w-[calc(100%-2rem)] flex-none snap-start bg-muted animate-pulse rounded-lg sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with billing toggle and scroll arrows */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
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
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => scroll('left')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => scroll('right')}>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Scrolling Cards */}
      <div className="flex justify-center">
        <div
          ref={scrollContainerRef}
          className="scrollbar-none flex snap-x snap-mandatory gap-8 overflow-x-auto px-4 py-6 max-w-full scroll-pl-4"
        >
          {subscriptionTiers.map((tierData) => (
            <div
              key={tierData.tier}
              className="w-[calc(100%-2rem)] flex-none snap-start sm:w-[calc(50%-1.5rem)] lg:w-[calc(33.333%-1.5rem)]"
            >
              <SubscriptionTierCard
                {...tierData}
                price={isAnnual ? tierData.annualPrice : tierData.monthlyPrice}
                billingCycle={isAnnual ? 'annually' : 'monthly'}
                isCurrentTier={subscription.subscription_tier === tierData.tier}
                onSelect={() => handleTierSelect(tierData.tier)}
                disabled={processingTier === tierData.tier}
              />
            </div>
          ))}
        </div>
      </div>

      <AuthCheckoutModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onAuthenticated={handleAuthenticated}
        tierName={pendingTierData?.name || ''}
        pendingCheckoutData={
          pendingTier
            ? { tier: pendingTier, billingCycle: isAnnual ? 'annually' : 'monthly' }
            : null
        }
      />
    </div>
  );
};
