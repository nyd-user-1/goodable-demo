import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Feature list with checkmark icons
const features = [
  "Track legislation that matters to you",
  "AI-powered policy analysis in plain language",
  "Connect directly with your representatives",
  "Collaborate on community-driven solutions",
  "Real-time alerts on bills and votes",
];

// User type options
const userTypes = [
  { value: "engaged_citizen", label: "Engaged Citizen" },
  { value: "student", label: "Student" },
  { value: "staffer", label: "Legislative Staffer" },
  { value: "researcher", label: "Researcher" },
  { value: "journalist", label: "Journalist" },
  { value: "nonprofit", label: "Nonprofit Professional" },
  { value: "lobbyist", label: "Lobbyist / Advocate" },
  { value: "other", label: "Other" },
];

// Policy interest options
const policyInterests = [
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "environment", label: "Environment & Climate" },
  { value: "economy", label: "Economy & Jobs" },
  { value: "housing", label: "Housing" },
  { value: "criminal_justice", label: "Criminal Justice" },
  { value: "immigration", label: "Immigration" },
  { value: "technology", label: "Technology & Privacy" },
  { value: "civil_rights", label: "Civil Rights" },
  { value: "transportation", label: "Transportation" },
];

type Step = 1 | 2 | 3 | 4;

const Auth3: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form data
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState("");
  const [policyInterest, setPolicyInterest] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");

  const progress = (step / 4) * 100;

  const handleContinue = async () => {
    if (step === 1) {
      // Validate email
      if (!email || !email.includes('@')) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address",
          variant: "destructive"
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Validate selections
      if (!userType || !policyInterest) {
        toast({
          title: "Please complete all fields",
          description: "Select your background and policy interest",
          variant: "destructive"
        });
        return;
      }
      setStep(3);
    } else if (step === 3) {
      // Create account
      if (!fullName.trim()) {
        toast({
          title: "Name required",
          description: "Please enter your full name",
          variant: "destructive"
        });
        return;
      }

      setIsLoading(true);

      try {
        // Generate a random password for passwordless signup
        // In production, you'd want to use magic link or OAuth
        const tempPassword = crypto.randomUUID();

        const { data, error } = await supabase.auth.signUp({
          email,
          password: tempPassword,
          options: {
            data: {
              full_name: fullName,
              user_type: userType,
              policy_interests: policyInterest,
            }
          }
        });

        if (error) {
          // If user already exists, try to sign in instead
          if (error.message.includes('already registered')) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Please log in instead.",
              variant: "destructive"
            });
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
              display_name: fullName,
              user_type: userType,
              policy_interests: policyInterest,
            }, {
              onConflict: 'user_id'
            });

          if (profileError) {
            console.error('Profile update error:', profileError);
            // Don't block the flow for profile errors
          }
        }

        setStep(4);
      } catch (error: any) {
        toast({
          title: "Error creating account",
          description: error.message || "Please try again",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1 && step < 4) {
      setStep((step - 1) as Step);
    }
  };

  const handleExplore = () => {
    navigate('/new-chat');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Marketing Content */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 py-12">
        {/* Free trial badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium w-fit mb-8">
          <span className="text-base">✨</span>
          Free 30-day trial
        </div>

        {/* Headline */}
        <h1 className="text-5xl font-bold tracking-tight mb-6 leading-tight">
          Make your voice<br />
          heard in democracy
        </h1>

        {/* Description */}
        <p className="text-lg text-muted-foreground mb-10 max-w-lg">
          Join thousands of engaged citizens using AI-powered tools to track legislation,
          understand policy impact, and take meaningful civic action. Democracy works better
          when you're involved.
        </p>

        {/* Features list */}
        <div className="space-y-4 mb-12">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <span className="text-base font-medium">{feature}</span>
            </div>
          ))}
        </div>

        {/* Logos section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {/* Placeholder logos - using emoji/text as stand-ins */}
            <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center text-orange-600 text-xs font-bold">AI</div>
            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-600 text-xs font-bold">G</div>
            <div className="w-8 h-8 bg-cyan-100 rounded flex items-center justify-center text-cyan-600 text-xs font-bold">★</div>
            <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-600 text-xs font-bold">S</div>
            <div className="w-8 h-8 bg-indigo-100 rounded flex items-center justify-center text-indigo-600 text-xs font-bold">U</div>
          </div>
          <div className="text-sm">
            <p className="font-semibold">Leveraging AI & APIs</p>
            <p className="text-muted-foreground">To make democracy work</p>
          </div>
        </div>
      </div>

      {/* Right Side - Multi-step Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Form Card */}
          <div className="bg-background border rounded-xl shadow-sm p-8">
            {/* Progress bar */}
            <div className="mb-6">
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>Step {step} of 4</span>
                <span>{progress}% complete</span>
              </div>
            </div>

            {/* Step 1: Email */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold">Get Started</h2>
                  <p className="text-muted-foreground mt-1">Enter your email to begin</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll send you updates on legislation you care about.
                  </p>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleContinue}
                >
                  Continue
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By continuing, you agree to our{' '}
                  <a href="/terms" className="underline hover:text-foreground">Terms of Service</a>
                  {' '}and{' '}
                  <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>
                </p>
              </div>
            )}

            {/* Step 2: Background */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold">Your Background</h2>
                  <p className="text-muted-foreground mt-1">Help us personalize your experience</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>I am a...</Label>
                    <Select value={userType} onValueChange={setUserType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        {userTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Policy Interests</Label>
                    <Select value={policyInterest} onValueChange={setPolicyInterest}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select primary interest" />
                      </SelectTrigger>
                      <SelectContent>
                        {policyInterests.map((interest) => (
                          <SelectItem key={interest.value} value={interest.value}>
                            {interest.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    size="lg"
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    size="lg"
                    onClick={handleContinue}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Personal Details */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold">Personal Details</h2>
                  <p className="text-muted-foreground mt-1">Just one more step</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                  />
                  <p className="text-xs text-muted-foreground">
                    This helps us personalize your civic engagement experience.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    size="lg"
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    size="lg"
                    onClick={handleContinue}
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating..." : "Start My Trial"}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Complete */}
            {step === 4 && (
              <div className="space-y-6 text-center">
                <div>
                  <h2 className="text-2xl font-bold">Complete</h2>
                  <p className="text-muted-foreground mt-1">You're all set!</p>
                </div>

                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold">
                    Welcome to Goodable, {fullName.split(' ')[0]}!
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Check your email to start tracking legislation and making your voice heard.
                  </p>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleExplore}
                >
                  Explore the Platform
                </Button>
              </div>
            )}
          </div>

          {/* Security footer */}
          <div className="flex items-center justify-center gap-4 mt-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              SSL secured
            </div>
            <span>•</span>
            <span>No spam</span>
            <span>•</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth3;
