import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';

interface SubscriptionTierCardProps {
  tier: string;
  name: string;
  price: string;
  monthlyPrice?: string;
  annualPrice?: string;
  billingCycle?: 'monthly' | 'annually';
  description: string;
  features: string[];
  isCurrentTier?: boolean;
  isPopular?: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

export const SubscriptionTierCard = ({
  tier,
  name,
  price,
  monthlyPrice,
  annualPrice,
  billingCycle = 'monthly',
  description,
  features,
  isCurrentTier = false,
  isPopular = false,
  onSelect,
  disabled = false
}: SubscriptionTierCardProps) => {
  const displayPrice = tier === 'free' ? '$0' : price;
  const billingText = tier === 'free' ? '' : `/${billingCycle === 'annually' ? 'month (billed annually)' : 'month'}`;
  
  const monthlyEquivalent = billingCycle === 'annually' && monthlyPrice && annualPrice
    ? ` (${monthlyPrice}/month if paid monthly)`
    : '';
  return (
    <Card className={`relative h-full min-h-[420px] flex flex-col ${isCurrentTier ? 'ring-2 ring-primary' : ''} ${isPopular ? 'border-primary' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground">
            <Star className="w-3 h-3 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}
      
      {isCurrentTier && (
        <div className="absolute -top-3 right-4">
          <Badge variant="secondary">Current Plan</Badge>
        </div>
      )}

      <CardHeader className="text-center">
        <CardTitle className="text-xl">{name}</CardTitle>
        <div className="text-3xl font-bold text-primary">
          {displayPrice}
          <span className="text-lg font-normal text-muted-foreground">{billingText}</span>
        </div>
        {monthlyEquivalent && (
          <p className="text-xs text-muted-foreground">{monthlyEquivalent}</p>
        )}
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-between space-y-4">
        <div className="flex-1">
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="pt-4">
          <Button 
            onClick={onSelect} 
            disabled={disabled || isCurrentTier}
            className="w-full"
            variant={isCurrentTier ? "outline" : "default"}
          >
            {isCurrentTier ? "Current Plan" : `Upgrade to ${name}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};