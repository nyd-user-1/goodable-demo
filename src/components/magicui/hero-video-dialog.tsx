import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroVideoDialogProps {
  className?: string;
  animationStyle?: "from-center" | "from-top" | "from-left" | "from-right";
  videoSrc: string;
  thumbnailSrc: string;
  thumbnailAlt: string;
}

export default function HeroVideoDialog({
  className,
  animationStyle = "from-center",
  videoSrc,
  thumbnailSrc,
  thumbnailAlt,
}: HeroVideoDialogProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
      <DialogTrigger asChild>
        <div
          className={cn(
            "relative cursor-pointer group overflow-hidden rounded-2xl border shadow-xl",
            "transition-all duration-300 hover:scale-[1.02]",
            className
          )}
        >
          <img
            src={thumbnailSrc}
            alt={thumbnailAlt}
            className="w-full h-full object-cover aspect-video"
          />
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 sm:w-8 sm:h-8 text-[#3D63DD] ml-1" />
            </div>
          </div>
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </div>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl w-[95vw] p-0">
        <div className="relative aspect-video">
          <iframe
            src={videoSrc}
            title="Video player"
            className="w-full h-full rounded-lg"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}