import React from 'react';
import { GalleryVerticalEnd } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import { ScrollProgress } from "@/components/magicui/scroll-progress";
export const Auth: React.FC = () => {
  return (
    <div 
      className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 relative"
      style={{
        backgroundImage: 'url(/goodable-heart-terrarium.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Background overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      
      <ScrollProgress className="top-0 z-10" />
      
      <div className="flex w-full max-w-sm flex-col gap-6 relative z-10">
        <a href="/" className="flex items-center gap-2 self-center font-medium text-white drop-shadow-lg">
          ❤️ Goodable
        </a>        
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};