import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeftIcon, ArrowRightIcon, CheckCircle2Icon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Advertise() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [industry, setIndustry] = useState('');
  const [company, setCompany] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [adOption, setAdOption] = useState<string | null>(null);

  // Pre-fill from logged in user
  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      const meta = user.user_metadata;
      if (meta?.full_name) setName(meta.full_name);
      else if (meta?.name) setName(meta.name);
    }
  }, [user]);

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const interestOptions = [
    'Advocacy',
    'Bills',
    'Budget',
    'Committees',
    'Contracts',
    'Lobbying',
    'Members',
    'News',
    'School Funding',
  ];

  const adOptions = [
    {
      id: 'hero-carousel',
      title: 'Hero Carousel',
      description: 'Premium placement in the main hero section. Maximum visibility with rotating featured content.',
      price: 'Premium',
    },
    {
      id: 'category-card',
      title: 'Category Card',
      description: 'Sponsored category card alongside Bill Research, Policy, Advocacy, and Departments.',
      price: 'Standard',
    },
    {
      id: 'sponsored-prompts',
      title: 'Sponsored by Pill (Prompts)',
      description: 'Your organization featured as sponsor above the community prompts section.',
      price: 'Basic',
    },
    {
      id: 'sponsored-lists',
      title: 'Sponsored by Pill (Lists)',
      description: 'Your organization featured as sponsor at the top of the Lists page.',
      price: 'Basic',
    },
  ];

  return (
    <>
      {/* Hero */}
      <div className="bg-background relative grid min-h-[600px] overflow-hidden md:min-h-screen md:grid-cols-2">
        {/* Left Image */}
        <div className="relative hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop"
            alt="Team collaboration"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="bg-primary/20 absolute inset-0 flex items-center justify-center p-10 backdrop-blur-sm">
            <div className="bg-background/80 max-w-md rounded-lg p-8 shadow-lg backdrop-blur-md">
              <h2 className="mb-4 text-2xl font-bold">
                Why advertise on NYSgpt?
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle2Icon className="text-primary mt-0.5 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Reach legislators, staffers, and policy professionals</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2Icon className="text-primary mt-0.5 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Connect with nonprofits and advocacy organizations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2Icon className="text-primary mt-0.5 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Target lobbyists and government affairs professionals</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2Icon className="text-primary mt-0.5 mr-2 h-5 w-5 flex-shrink-0" />
                  <span>Engage an audience actively researching policy and legislation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <h1 className="mb-2 scroll-m-20 text-3xl font-bold tracking-tight md:text-4xl">
              Advertise on NYSgpt
            </h1>
            <p className="text-muted-foreground mb-8">
              Complete the steps below to get started.
            </p>

            {/* Step Counter */}
            <div className="mb-8 flex items-center">
              <div className="bg-muted h-1 flex-1 overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                ></div>
              </div>
              <span className="ml-4 text-sm font-medium">
                Step {step} of {totalSteps}
              </span>
            </div>

            {/* Step 1 - Basic Info */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="mb-4 text-xl font-semibold">
                  Basic Information
                </h2>
                <div>
                  <Label htmlFor="name" className="mb-2">
                    Full name
                  </Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="mb-2">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {!user && (
                  <div>
                    <Label htmlFor="password" className="mb-2">
                      Create password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                )}
                <div className="pt-4">
                  <Button className="w-full" onClick={nextStep}>
                    Continue <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2 - Profile */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="mb-4 text-xl font-semibold">Profile Details</h2>
                <div>
                  <Label htmlFor="industry" className="mb-2">
                    Industry
                  </Label>
                  <Input
                    id="industry"
                    placeholder="Government, Nonprofit, Legal, etc."
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="company" className="mb-2">
                    Company
                  </Label>
                  <Input
                    id="company"
                    placeholder="Acme Inc."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="companySize" className="mb-2">
                    Company Size
                  </Label>
                  <Input
                    id="companySize"
                    placeholder="1-10, 11-50, 51-200, 200+"
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={prevStep}>
                    <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button className="flex-1" onClick={nextStep}>
                    Continue <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3 - Interests */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="mb-4 text-xl font-semibold">Interests</h2>
                <p className="text-muted-foreground mb-4 text-sm">
                  Select the topics you're interested in:
                </p>

                <div className="space-y-3">
                  {interestOptions.map((interest) => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox
                        id={interest}
                        checked={interests.includes(interest)}
                        onCheckedChange={() => toggleInterest(interest)}
                      />
                      <Label htmlFor={interest} className="cursor-pointer">
                        {interest}
                      </Label>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-8">
                  <Button variant="outline" onClick={prevStep}>
                    <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button className="flex-1" onClick={nextStep}>
                    Continue <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4 - Ad Options */}
            {step === 4 && (
              <div className="space-y-4">
                <h2 className="mb-4 text-xl font-semibold">Choose an Ad Option</h2>
                <p className="text-muted-foreground mb-4 text-sm">
                  Select the advertising placement that best fits your goals:
                </p>

                <div className="space-y-3">
                  {adOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setAdOption(option.id)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        adOption === option.id
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border hover:border-muted-foreground/50 hover:bg-muted/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{option.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          option.price === 'Premium'
                            ? 'bg-amber-100 text-amber-700'
                            : option.price === 'Standard'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {option.price}
                        </span>
                      </div>
                      {adOption === option.id && (
                        <div className="mt-2 flex items-center text-primary text-xs">
                          <CheckCircle2Icon className="h-3.5 w-3.5 mr-1" />
                          Selected
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 pt-8">
                  <Button variant="outline" onClick={prevStep}>
                    <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button className="flex-1" disabled={!adOption}>
                    Submit Inquiry
                  </Button>
                </div>
              </div>
            )}

            <p className="text-muted-foreground mt-8 text-center text-xs">
              By submitting, you agree to our{' '}
              <a href="/terms" className="hover:text-foreground underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="hover:text-foreground underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
      {/* End Hero */}
    </>
  );
}
