import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Check, Plus, Minus, ArrowLeft, ArrowRight } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';

interface BasePlan {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  popular?: boolean;
}

interface CustomizationOption {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  category: string;
}

interface CustomPlan {
  basePlan: BasePlan;
  addOns: CustomizationOption[];
  teamSize: number;
  isAnnual: boolean;
}

const basePlans: BasePlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 9,
    annualPrice: 90,
    features: [
      'Legislative Research Access',
      'Basic Bill Tracking',
      'Committee Information',
      'Member Directory',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    monthlyPrice: 29,
    annualPrice: 290,
    features: [
      'Everything in Starter',
      'Advanced Analytics',
      'Custom Reports',
      'Email Support',
      'Export Features',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 99,
    annualPrice: 990,
    features: [
      'Everything in Professional',
      'API Access',
      'Priority Support',
      'Custom Integrations',
      'Dedicated Account Manager',
    ],
  },
];

const customizationOptions: CustomizationOption[] = [
  {
    id: 'api-access',
    name: 'API Access',
    description: 'Full API access for custom integrations',
    monthlyPrice: 10,
    annualPrice: 100,
    category: 'Integration',
  },
  {
    id: 'priority-support',
    name: 'Priority Support',
    description: '24/7 priority customer support',
    monthlyPrice: 15,
    annualPrice: 150,
    category: 'Support',
  },
  {
    id: 'advanced-analytics',
    name: 'Advanced Analytics',
    description: 'In-depth analytics and reporting',
    monthlyPrice: 20,
    annualPrice: 200,
    category: 'Analytics',
  },
  {
    id: 'white-label',
    name: 'White Label',
    description: 'Remove branding and customize interface',
    monthlyPrice: 25,
    annualPrice: 250,
    category: 'Branding',
  },
  {
    id: 'custom-training',
    name: 'Custom Training',
    description: 'Personalized training sessions for your team',
    monthlyPrice: 30,
    annualPrice: 300,
    category: 'Training',
  },
];

export function PricingBuilder() {
  const { createCheckout } = useSubscription();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [customPlan, setCustomPlan] = useState<CustomPlan>({
    basePlan: basePlans[1], // Default to Professional
    addOns: [],
    teamSize: 5,
    isAnnual: false,
  });

  const handleBasePlanSelect = (plan: BasePlan) => {
    setCustomPlan(prev => ({
      ...prev,
      basePlan: plan
    }));
  };

  const handleAddOnToggle = (addOn: CustomizationOption) => {
    setCustomPlan(prev => ({
      ...prev,
      addOns: prev.addOns.some(a => a.id === addOn.id)
        ? prev.addOns.filter(a => a.id !== addOn.id)
        : [...prev.addOns, addOn]
    }));
  };

  const handleTeamSizeChange = (value: number[]) => {
    setCustomPlan(prev => ({
      ...prev,
      teamSize: value[0]
    }));
  };

  const handleBillingToggle = () => {
    setCustomPlan(prev => ({
      ...prev,
      isAnnual: !prev.isAnnual
    }));
  };

  const calculateTotalPrice = () => {
    const basePlanPrice = customPlan.isAnnual ? customPlan.basePlan.annualPrice : customPlan.basePlan.monthlyPrice;
    const addOnsPrice = customPlan.addOns.reduce((total, addOn) => {
      return total + (customPlan.isAnnual ? addOn.annualPrice : addOn.monthlyPrice);
    }, 0);
    const teamMultiplier = customPlan.teamSize;
    return Math.round((basePlanPrice + addOnsPrice) * (teamMultiplier / 5)); // Assume base pricing is for 5 team members
  };

  const calculateSavings = () => {
    if (!customPlan.isAnnual) return 0;
    const monthlyTotal = calculateTotalPrice() / 10; // Monthly equivalent if annual
    const annualMonthly = calculateTotalPrice() / 12;
    return Math.round((monthlyTotal - annualMonthly) * 12);
  };

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      await createCheckout(customPlan.basePlan.id as any, customPlan.isAnnual ? 'annually' : 'monthly');
      toast({
        title: 'Redirecting to checkout',
        description: 'You will be redirected to complete your custom plan purchase.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create checkout session. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Build Your Perfect Plan</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Customize your subscription to match your exact needs. Start with a base plan and add the features that matter most to you.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className={`flex items-center space-x-2 ${currentStep === 1 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            1
          </div>
          <span className="font-medium">Choose Base Plan</span>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
        <div className={`flex items-center space-x-2 ${currentStep === 2 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            2
          </div>
          <span className="font-medium">Customize</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Steps */}
        <div className="xl:col-span-2 space-y-6">
          {/* Step 1: Base Plan Selection */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Choose Your Base Plan</CardTitle>
                <CardDescription>
                  Select the foundation plan that best fits your core needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {basePlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative border rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
                        customPlan.basePlan.id === plan.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleBasePlanSelect(plan)}
                    >
                      {plan.popular && (
                        <Badge className="absolute -top-2 left-4">Most Popular</Badge>
                      )}
                      <div className="space-y-4">
                        <div className="text-center">
                          <h3 className="text-xl font-semibold">{plan.name}</h3>
                          <div className="mt-2">
                            <span className="text-3xl font-bold">${plan.monthlyPrice}</span>
                            <span className="text-muted-foreground">/month</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ${plan.annualPrice}/year
                          </div>
                        </div>
                        <ul className="space-y-2 text-sm">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <Check className="w-4 h-4 text-primary" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {customPlan.basePlan.id === plan.id && (
                        <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-6">
                  <Button onClick={() => setCurrentStep(2)}>
                    Continue to Customization
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Customization */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(1)}
                      className="mr-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    Step 2: Customize Your Plan
                  </CardTitle>
                  <CardDescription>
                    Add features and adjust settings to perfect your plan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Team Size */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Team Size: {customPlan.teamSize} members</Label>
                    <Slider
                      value={[customPlan.teamSize]}
                      onValueChange={handleTeamSizeChange}
                      min={1}
                      max={50}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>1 member</span>
                      <span>50+ members</span>
                    </div>
                  </div>

                  {/* Billing Cycle */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Billing Cycle</Label>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-4 h-4 rounded-full border-2 cursor-pointer ${
                            !customPlan.isAnnual ? 'border-primary bg-primary' : 'border-muted-foreground'
                          }`}
                          onClick={() => setCustomPlan(prev => ({ ...prev, isAnnual: false }))}
                        />
                        <span>Monthly</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-4 h-4 rounded-full border-2 cursor-pointer ${
                            customPlan.isAnnual ? 'border-primary bg-primary' : 'border-muted-foreground'
                          }`}
                          onClick={() => setCustomPlan(prev => ({ ...prev, isAnnual: true }))}
                        />
                        <span>Annual</span>
                        <Badge variant="secondary" className="text-xs">Save 20%</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Add-ons */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Add-ons</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customizationOptions.map((addOn) => {
                        const isSelected = customPlan.addOns.some(a => a.id === addOn.id);
                        return (
                          <div
                            key={addOn.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-sm ${
                              isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => handleAddOnToggle(addOn)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium">{addOn.name}</h4>
                                  <Badge variant="outline" className="text-xs">{addOn.category}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{addOn.description}</p>
                                <div className="mt-2 text-sm font-medium">
                                  +${customPlan.isAnnual ? addOn.annualPrice : addOn.monthlyPrice}
                                  {customPlan.isAnnual ? '/year' : '/month'}
                                </div>
                              </div>
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Right Column - Plan Preview */}
        <div className="xl:col-span-1">
          <div className="sticky top-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Custom Plan</CardTitle>
                <CardDescription>Live preview of your selections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Base Plan */}
                <div>
                  <h4 className="font-medium mb-2">Base Plan</h4>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{customPlan.basePlan.name}</span>
                      <span className="text-sm">
                        ${customPlan.isAnnual ? customPlan.basePlan.annualPrice : customPlan.basePlan.monthlyPrice}
                        {customPlan.isAnnual ? '/year' : '/month'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Add-ons */}
                {customPlan.addOns.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Add-ons ({customPlan.addOns.length})</h4>
                    <div className="space-y-2">
                      {customPlan.addOns.map((addOn) => (
                        <div key={addOn.id} className="bg-muted/50 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">{addOn.name}</span>
                            <span className="text-sm">
                              +${customPlan.isAnnual ? addOn.annualPrice : addOn.monthlyPrice}
                              {customPlan.isAnnual ? '/year' : '/month'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Team Size */}
                <div>
                  <h4 className="font-medium mb-2">Team Size</h4>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{customPlan.teamSize} members</span>
                      <span className="text-sm">×{(customPlan.teamSize / 5).toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold">
                      ${calculateTotalPrice()}{customPlan.isAnnual ? '/year' : '/month'}
                    </span>
                  </div>
                  {customPlan.isAnnual && calculateSavings() > 0 && (
                    <div className="text-sm text-green-600">
                      You save ${calculateSavings()} per year
                    </div>
                  )}
                </div>

                {/* Subscribe Button */}
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleSubscribe}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : `Subscribe Now - $${calculateTotalPrice()}${customPlan.isAnnual ? '/year' : '/month'}`}
                </Button>

                <div className="text-xs text-muted-foreground text-center">
                  Cancel anytime. No setup fees.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}