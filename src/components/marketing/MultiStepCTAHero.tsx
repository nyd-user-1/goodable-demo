'use client';

import { useState } from 'react';
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

const benefits = [
  'Setup in under 3 minutes',
  'No credit card required',
  'Free 30-day trial included',
  '24/7 customer support',
  'Cancel anytime, no questions asked',
];

const socialProof = [
  'https://cdn.pixabay.com/photo/2019/11/03/20/11/portrait-4599553_1280.jpg?w=150&h=150&fit=crop&crop=face',
  'https://cdn.pixabay.com/photo/2016/11/21/12/42/beard-1845166_1280.jpg?w=150&h=150&fit=crop&crop=face',
  'https://cdn.pixabay.com/photo/2017/02/16/23/10/smile-2072907_1280.jpg?w=150&h=150&fit=crop&crop=face',
  'https://cdn.pixabay.com/photo/2018/01/21/14/16/woman-3096664_1280.jpg?w=150&h=150&fit=crop&crop=face',
];

export default function MultiStepCTAHero() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    companySize: '',
    useCase: '',
    name: '',
  });

  const steps = [
    {
      title: 'Get Started',
      description: 'Enter your email to begin',
      fields: ['email'],
    },
    {
      title: 'About Your Company',
      description: 'Help us customize your experience',
      fields: ['companySize', 'useCase'],
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

  const handleNext = () => {
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
                Transform your workflow in minutes, not months
              </h1>
              <p className="text-muted-foreground max-w-4xl text-base text-balance sm:text-lg">
                Join 25,000+ teams who&apos;ve streamlined their processes with
                our intelligent automation platform. Get started in under 3
                minutes.
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
                <div className="font-semibold">2,500+ this week</div>
                <div className="text-muted-foreground">
                  People joined our platform
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
                      <Label htmlFor="email">Work Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div className="text-muted-foreground text-xs">
                      We&apos;ll use this to set up your account and send you
                      updates.
                    </div>
                  </div>
                )}

                {/* Step 1: Company Info */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="companySize">Company Size</Label>
                      <Select
                        value={formData.companySize}
                        onValueChange={(value) =>
                          setFormData({ ...formData, companySize: value })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">
                            51-200 employees
                          </SelectItem>
                          <SelectItem value="201-1000">
                            201-1000 employees
                          </SelectItem>
                          <SelectItem value="1000+">1000+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="useCase">Primary Use Case</Label>
                      <Select
                        value={formData.useCase}
                        onValueChange={(value) =>
                          setFormData({ ...formData, useCase: value })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="What will you use this for?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="project-management">
                            Project Management
                          </SelectItem>
                          <SelectItem value="team-collaboration">
                            Team Collaboration
                          </SelectItem>
                          <SelectItem value="workflow-automation">
                            Workflow Automation
                          </SelectItem>
                          <SelectItem value="data-analysis">
                            Data Analysis
                          </SelectItem>
                          <SelectItem value="other">Other</SelectItem>
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
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div className="text-muted-foreground text-xs">
                      This helps us personalize your experience.
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
                        Welcome aboard, {formData.name}!
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Check your email for next steps to access your account.
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
                      className="flex-1 bg-foreground text-background hover:bg-foreground/90"
                    >
                      {currentStep === 2 ? 'Complete Setup' : 'Continue'}
                    </Button>
                  )}
                  {currentStep === 3 && (
                    <Button className="w-full bg-foreground text-background hover:bg-foreground/90">
                      Access Dashboard
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
