'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const benefits = [
  'Track legislation that matters to you',
  'AI-powered policy analysis in plain language',
  'Connect directly with your representatives',
  'Collaborate on community-driven solutions',
  'Real-time alerts on bills and votes',
];

const socialProof = [
  '/claude-ai-icon-65aa.png',
  '/OAI%20LOGO.png',
  '/PPLX%20LOGO.png',
  '/nys-assembly-seal.png',
  '/nys-senate-seal.png',
];

export default function MultiStepCTAHero() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: '',
    interests: '',
    name: '',
  });

  const steps = [
    {
      title: 'Get Started',
      description: 'Enter your email to begin',
      fields: ['email'],
    },
    {
      title: 'Your Background',
      description: 'Help us personalize your experience',
      fields: ['role', 'interests'],
    },
    {
      title: 'Personal Details',
      description: 'Just one more step',
      fields: ['name'],
    },
    {
      title: 'Complete',
      description: "You're all set!",
      fields: [],
    },
  ];

  const handleNext = async () => {
    // Validation for each step
    if (currentStep === 0) {
      if (!formData.email || !formData.email.includes('@')) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address",
          variant: "destructive"
        });
        return;
      }
    }

    if (currentStep === 1) {
      if (!formData.role || !formData.interests) {
        toast({
          title: "Please complete all fields",
          description: "Select your role and policy interests",
          variant: "destructive"
        });
        return;
      }
    }

    // On step 2 (clicking "Start My Trial"), create the account
    if (currentStep === 2) {
      if (!formData.name.trim()) {
        toast({
          title: "Name required",
          description: "Please enter your full name",
          variant: "destructive"
        });
        return;
      }

      setIsLoading(true);

      try {
        // Generate a temporary password for signup
        const tempPassword = crypto.randomUUID();

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: tempPassword,
          options: {
            data: {
              full_name: formData.name,
              user_type: formData.role,
              policy_interests: formData.interests,
            }
          }
        });

        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Please log in instead.",
              variant: "destructive"
            });
            setIsLoading(false);
            return;
          }
          throw error;
        }

        // Update profile with additional data
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              user_id: data.user.id,
              display_name: formData.name,
              user_type: formData.role,
              policy_interests: formData.interests,
            }, {
              onConflict: 'user_id'
            });

          if (profileError) {
            console.error('Profile update error:', profileError);
          }
        }

        setIsLoading(false);
        setCurrentStep(3); // Move to complete step
        return;
      } catch (error: any) {
        toast({
          title: "Error creating account",
          description: error.message || "Please try again",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="bg-background relative">
      <div className="container mx-auto px-4 py-24 md:px-6 md:py-28 lg:py-32 2xl:max-w-[1400px]">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left Side - Value Proposition */}
          <div className="space-y-8">
            <div className="space-y-6">
              <Badge
                variant="outline"
                className="border-border bg-muted text-foreground"
              >
                ✨ Free 30-day trial
              </Badge>
              <h1 className="text-foreground max-w-4xl text-4xl leading-tight font-semibold tracking-tight text-balance lg:leading-[1.1] lg:font-semibold xl:text-5xl xl:tracking-tighter">
                Make your voice heard in democracy
              </h1>
              <p className="text-muted-foreground max-w-4xl text-base text-balance sm:text-lg">
                Join thousands of engaged citizens using AI-powered tools to track legislation,
                understand policy impact, and take meaningful civic action. Democracy works better
                when you&apos;re involved.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="bg-muted text-foreground flex h-8 w-8 items-center justify-center rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 12l2 2 4-4" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </div>
                  <span className="text-foreground font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-6">
              <div className="flex -space-x-2">
                {socialProof.map((item, i) => (
                  <div
                    key={i}
                    className="bg-muted border-background h-10 w-10 rounded-full border-2"
                    style={{
                      backgroundImage: `url(${item})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                ))}
              </div>
              <div className="text-sm">
                <div className="font-semibold">Leveraging AI & APIs</div>
                <div className="text-muted-foreground">
                  To make democracy work
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Multi-Step Form */}
          <div className="mx-auto w-full max-w-md">
            <Card className="shadow-xl">
              <CardHeader className="pb-4">
                <div className="mb-4 space-y-2">
                  {/* Custom Progress Bar - Black */}
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-muted-foreground flex justify-between text-xs">
                    <span>
                      Step {currentStep + 1} of {steps.length}
                    </span>
                    <span>{Math.round(progress)}% complete</span>
                  </div>
                </div>
                <CardTitle className="text-center">
                  {steps[currentStep].title}
                </CardTitle>
                <p className="text-muted-foreground text-center text-sm">
                  {steps[currentStep].description}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 0: Email */}
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div className="text-muted-foreground text-xs">
                      We&apos;ll send you updates on legislation you care about.
                    </div>
                  </div>
                )}

                {/* Step 1: Background */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="role">I am a...</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) =>
                          setFormData({ ...formData, role: value })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="citizen">Engaged Citizen</SelectItem>
                          <SelectItem value="advocate">Policy Advocate</SelectItem>
                          <SelectItem value="researcher">Researcher / Academic</SelectItem>
                          <SelectItem value="nonprofit">Non-Profit Professional</SelectItem>
                          <SelectItem value="staffer">Legislative Staffer</SelectItem>
                          <SelectItem value="journalist">Journalist</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="interests">Policy Interests</Label>
                      <Select
                        value={formData.interests}
                        onValueChange={(value) =>
                          setFormData({ ...formData, interests: value })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="What issues matter to you?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="environment">Environment & Climate</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="economy">Economy & Jobs</SelectItem>
                          <SelectItem value="justice">Criminal Justice</SelectItem>
                          <SelectItem value="housing">Housing</SelectItem>
                          <SelectItem value="all">All Policy Areas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Step 2: Personal Details */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Jane Smith"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div className="text-muted-foreground text-xs">
                      This helps us personalize your civic engagement experience.
                    </div>
                  </div>
                )}

                {/* Step 3: Complete */}
                {currentStep === 3 && (
                  <div className="space-y-4 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 12l2 2 4-4" />
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        Welcome to NYSgpt, {formData.name}!
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Check your email to start tracking legislation and making your voice heard.
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {currentStep > 0 && currentStep < 3 && (
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="flex-1"
                    >
                      Back
                    </Button>
                  )}
                  {currentStep < 3 && (
                    <Button
                      onClick={handleNext}
                      disabled={isLoading}
                      className="flex-1 bg-foreground text-background hover:bg-foreground/90"
                    >
                      {isLoading ? 'Creating account...' : currentStep === 2 ? 'Start My Trial' : 'Continue'}
                    </Button>
                  )}
                  {currentStep === 3 && (
                    <Button
                      className="w-full bg-foreground text-background hover:bg-foreground/90"
                      onClick={() => navigate('/new-chat')}
                    >
                      Explore the Platform
                    </Button>
                  )}
                </div>

                {currentStep === 0 && (
                  <div className="text-center">
                    <p className="text-muted-foreground text-xs">
                      By continuing, you agree to our{' '}
                      <a href="#" className="text-foreground underline">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-foreground underline">
                        Privacy Policy
                      </a>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Badge */}
            <div className="text-muted-foreground mt-4 flex items-center justify-center gap-2 text-xs">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-500"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <span>SSL secured • No spam • Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
