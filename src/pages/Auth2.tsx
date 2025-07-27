import React from 'react';
import { LoginForm } from "@/components/login-form";
import { ScrollProgress } from "@/components/magicui/scroll-progress";

export const Auth2: React.FC = () => {
  // URL-encoded filename for the background image (note capital R)
  const backgroundUrl = '/Rectangle%201.avif';

  return (
    <div className="flex min-h-screen">
      {/* Left side - Image */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative"
        style={{
          backgroundImage: `url(${backgroundUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Optional overlay for better text visibility if needed */}
        <div className="absolute inset-0 bg-black/10" />
        
        {/* Optional content on the image side */}
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <blockquote className="text-lg font-medium mb-2">
            "This library has saved me countless hours of work and helped me deliver 
            stunning designs to my clients faster than ever before."
          </blockquote>
          <cite className="text-sm opacity-90">- Sofia Davis</cite>
        </div>
      </div>
      
      {/* Right side - Auth form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        <ScrollProgress className="top-0" />
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 lg:p-8">
          <a href="/" className="flex items-center gap-2 font-medium text-foreground">
            ❤️ Goodable
          </a>
          <a 
            href="/auth" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Login
          </a>
        </div>
        
        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
          <div className="w-full max-w-sm space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                Create an account
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your email below to create your account
              </p>
            </div>
            
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth2;