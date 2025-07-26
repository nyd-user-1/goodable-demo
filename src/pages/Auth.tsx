import React from 'react';
import { GalleryVerticalEnd } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import { ScrollProgress } from "@/components/magicui/scroll-progress";
import { useAsset } from '@/hooks/useAssets';

export const Auth: React.FC = () => {
  const { asset: backgroundAsset, loading } = useAsset('goodable-heart-terrarium');
  
  // Use asset URL if available, otherwise fallback to public directory
  const backgroundUrl = backgroundAsset?.url || '/goodable-heart-terrarium.png';

  return (
    <div 
      className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 relative"
      style={{
        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : 'none',
        backgroundColor: backgroundUrl ? 'transparent' : '#f1f5f9', // fallback color
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Background overlay for better text readability - only show if we have a background image */}
      {backgroundUrl && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      )}
      
      <ScrollProgress className="top-0 z-10" />
      
      <div className="flex w-full max-w-sm flex-col gap-6 relative z-10">
        <a 
          href="/" 
          className={`flex items-center gap-2 self-center font-medium drop-shadow-lg ${
            backgroundUrl ? 'text-white' : 'text-foreground'
          }`}
        >
          ❤️ Goodable
        </a>        
        <div className={`rounded-2xl p-6 shadow-2xl ${
          backgroundUrl 
            ? 'bg-white/95 backdrop-blur-sm border border-white/20' 
            : 'bg-card border border-border'
        }`}>
          <LoginForm />
        </div>
      </div>
    </div>
  );
};