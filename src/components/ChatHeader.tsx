import { ThemeToggle } from "@/components/ThemeToggle";
import { Command, PenSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Dropdown placeholder items
const dropdownPlaceholders = [
  { label: "Option 1", href: "#" },
  { label: "Option 2", href: "#" },
  { label: "Option 3", href: "#" },
  { label: "Option 4", href: "#" },
];

interface ChatHeaderProps {
  onNewChat?: () => void;
  onWhatIsGoodable?: () => void;
}

export function ChatHeader({ onNewChat, onWhatIsGoodable }: ChatHeaderProps) {
  const navigate = useNavigate();

  const handleNewChat = () => {
    if (onNewChat) {
      onNewChat();
    } else {
      // Fallback: refresh the page to start new chat
      window.location.reload();
    }
  };

  const handleHeartClick = () => {
    // Trigger confetti burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.1, y: 0.1 },
      colors: ['#ff6b6b', '#ff8e8e', '#ffb3b3', '#ffd4d4', '#3D63DD'],
    });

    // Trigger the "What is Goodable.dev?" prompt
    if (onWhatIsGoodable) {
      onWhatIsGoodable();
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-5 py-2 bg-background/80 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        {/* Left side - Heart Logo + New Chat Pencil */}
        <div className="flex items-center space-x-1">
          {/* Heart logo - triggers "What is Goodable?" */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleHeartClick}
                className="w-8 h-8 bg-card border rounded-lg flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
              >
                <span className="text-lg">❤️</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="font-medium">
              What is Goodable?
            </TooltipContent>
          </Tooltip>

          {/* Pencil icon - triggers new chat */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleNewChat}
                className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-lg transition-colors cursor-pointer"
              >
                <PenSquare className="h-4 w-4 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="font-medium">
              New chat
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Center - Marketing Navigation (desktop only) */}
        <nav className="hidden md:flex items-center gap-1">
          {/* About - simple link */}
          <Link
            to="/about"
            className="text-sm font-normal text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-2 rounded-lg transition-colors"
          >
            About
          </Link>

          {/* Academy - simple link */}
          <Link
            to="/academy"
            className="text-sm font-normal text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-2 rounded-lg transition-colors"
          >
            Academy
          </Link>

          {/* Features - dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="text-sm font-normal text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-2 rounded-lg transition-colors outline-none">
              Features
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[160px]">
              {dropdownPlaceholders.map((item) => (
                <DropdownMenuItem key={item.label} asChild>
                  <Link to={item.href}>{item.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Use Cases - dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="text-sm font-normal text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-2 rounded-lg transition-colors outline-none">
              Use Cases
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[160px]">
              {dropdownPlaceholders.map((item) => (
                <DropdownMenuItem key={item.label} asChild>
                  <Link to={item.href}>{item.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Non Profits - dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="text-sm font-normal text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-2 rounded-lg transition-colors outline-none">
              Non Profits
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[160px]">
              {dropdownPlaceholders.map((item) => (
                <DropdownMenuItem key={item.label} asChild>
                  <Link to={item.href}>{item.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Pricing - simple link */}
          <Link
            to="/pricing"
            className="text-sm font-normal text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-2 rounded-lg transition-colors"
          >
            Pricing
          </Link>
        </nav>

        {/* Right side - Controls */}
        <div className="flex items-center gap-2">
          {/* Theme toggle - hidden on mobile */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="hidden md:block">
                <ThemeToggle />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Toggle theme
            </TooltipContent>
          </Tooltip>
          {/* Command menu - desktop only */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="hidden md:inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
          {/* Log In button - routes to auth-2 (sign up page with login link) */}
          <button
            className="inline-flex items-center justify-center h-9 rounded-md px-3 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium"
            onClick={() => navigate('/auth-2')}
          >
            Log In
          </button>
        </div>
      </div>
    </nav>
  );
}
