import React from 'react';
import { GalleryVerticalEnd } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import { ScrollProgress } from "@/components/magicui/scroll-progress";
import { useAsset } from '@/hooks/useAssets';

export const Auth: React.FC = () => {
  // Use the uploaded Supabase asset
  const backgroundUrl = 'https://kwyjohornlgujoqypyvu.supabase.co/storage/v1/object/public/goodable-assets/6ba84657-f124-44a1-9e4d-bbe76860e13f/1753770311293_xys3n5.png';
  const loading = false;

  return (
    <div 
      className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 relative bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950"
      style={backgroundUrl && !loading ? {
        backgroundImage: `url(${backgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      } : {}}
    >
      {/* Background overlay for better text readability - only show if we have a background image */}
      {backgroundUrl && !loading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      )}
      
      <ScrollProgress className="top-0 z-10" />
      
      <div className="flex w-full max-w-sm flex-col gap-6 relative z-10">
        <a 
          href="/" 
          className={`flex items-center gap-2 self-center font-medium drop-shadow-lg ${
            backgroundUrl && !loading ? 'text-white' : 'text-foreground'
          }`}
        >
          ❤️ Goodable
        </a>        
        <div className={`rounded-2xl p-6 shadow-2xl ${
          backgroundUrl && !loading
            ? 'bg-white/95 backdrop-blur-sm border border-white/20' 
            : 'bg-white dark:bg-card border border-border'
        }`}>
          <LoginForm />
        </div>
      </div>
    </div>
  );
};