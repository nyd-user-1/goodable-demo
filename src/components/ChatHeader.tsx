import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Command, PenSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatHeaderProps {
  onNewChat?: () => void;
}

export function ChatHeader({ onNewChat }: ChatHeaderProps) {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);

  const handleNewChat = () => {
    if (onNewChat) {
      onNewChat();
    } else {
      // Fallback: refresh the page to start new chat
      window.location.reload();
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-5 py-2 bg-background/80 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        {/* Left side - Logo with New Chat on hover */}
        <div
          className="flex items-center space-x-2 cursor-pointer group"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={handleNewChat}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                {/* Heart logo - default state */}
                <div
                  className={`w-8 h-8 bg-card border rounded-lg flex items-center justify-center transition-opacity duration-200 ${
                    isHovering ? 'opacity-0' : 'opacity-100'
                  }`}
                >
                  <span className="text-lg">❤️</span>
                </div>
                {/* Pen icon - hover state */}
                <div
                  className={`absolute inset-0 w-8 h-8 bg-card border rounded-lg flex items-center justify-center transition-opacity duration-200 ${
                    isHovering ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <PenSquare className="h-4 w-4" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="font-medium">
              New chat
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ThemeToggle />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Toggle theme
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="hidden md:inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                onClick={() => {
                  const event = new KeyboardEvent('keydown', {
                    key: 'k',
                    metaKey: true,
                    ctrlKey: true,
                    bubbles: true
                  });
                  document.dispatchEvent(event);
                }}
              >
                <Command className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Command menu
            </TooltipContent>
          </Tooltip>
          <button
            className="inline-flex items-center justify-center h-9 rounded-md px-3 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors font-medium"
            onClick={() => navigate('/auth')}
          >
            Log In
          </button>
          <Button
            onClick={() => navigate('/auth-2')}
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            Sign Up
          </Button>
        </div>
      </div>
    </nav>
  );
}
