import { useState } from "react";
import { Command, PenSquare } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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

// Non Profits dropdown items
const nonProfitsDropdownItems = [
  { label: "Directory", href: "/nonprofits/directory" },
  { label: "Economic", href: "/nonprofits/economic-advocacy" },
  { label: "Environmental", href: "/nonprofits/environmental-advocacy" },
  { label: "Legal", href: "/nonprofits/legal-advocacy" },
  { label: "Social", href: "/nonprofits/social-advocacy" },
];

// Use Cases dropdown items
const useCasesDropdownItems = [
  { label: "Bills", href: "/use-cases/bills" },
  { label: "Committees", href: "/use-cases/committees" },
  { label: "Members", href: "/use-cases/members" },
  { label: "Policy", href: "/use-cases/policy" },
];

// About dropdown items
const aboutDropdownItems = [
  { label: "About", href: "/about" },
  { label: "AI Fluency", href: "/ai-fluency" },
  { label: "Constitution", href: "/constitution" },
  { label: "Digital Bill of Rights", href: "/digital-bill-of-rights" },
];

// Features dropdown items (sorted A-Z)
const featuresDropdownItems = [
  { label: "Bill Tracking", href: "/features/bill-tracking" },
  { label: "Citations", href: "/features/citations" },
  { label: "Contracts", href: "/features/contracts" },
  { label: "Excerpts", href: "/features/excerpts" },
  { label: "Letter Generation", href: "/features/letter-generation" },
  { label: "Live Feed", href: "/live-feed" },
  { label: "Multi-Engine Chat", href: "/features/multi-engine-chat" },
  { label: "Prompt Library", href: "/features/prompt-library" },
];

interface ChatHeaderProps {
  onNewChat?: () => void;
  onWhatIsGoodable?: () => void;
}

export function ChatHeader({ onNewChat, onWhatIsGoodable }: ChatHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [useCasesOpen, setUseCasesOpen] = useState(false);
  const [nonProfitsOpen, setNonProfitsOpen] = useState(false);

  const handleNewChat = () => {
    // If already on root, force a page reload to reset chat state
    if (location.pathname === '/') {
      window.location.href = '/';
      return;
    }
    // Otherwise navigate to root
    navigate('/');
  };

  const handleHeartClick = () => {
    // Trigger confetti burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.1, y: 0.1 },
      colors: ['#ff6b6b', '#ff8e8e', '#ffb3b3', '#ffd4d4', '#3D63DD'],
    });

    // Navigate to root with prompt to trigger "What is NYSgpt?" chat
    navigate('/?prompt=What%20is%20NYSgpt%3F');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-5 py-2 bg-background/80 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        {/* Left side - Heart Logo + New Chat Pencil */}
        <div className="flex items-center space-x-1">
          {/* NYSgpt button - triggers "What is NYSgpt?" */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleHeartClick}
                className="inline-flex items-center justify-center h-10 rounded-md px-3 text-black hover:bg-muted transition-colors font-semibold text-xl"
              >
                NYSgpt
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="font-medium">
              What is NYSgpt?
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
          {/* About - dropdown with clickable trigger */}
          <div
            onMouseEnter={() => setAboutOpen(true)}
            onMouseLeave={() => setAboutOpen(false)}
          >
            <DropdownMenu open={aboutOpen} onOpenChange={setAboutOpen} modal={false}>
              <DropdownMenuTrigger
                className="text-sm font-normal text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-2 rounded-lg transition-colors outline-none"
                onClick={() => navigate('/about')}
              >
                About
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={4} className="min-w-[180px]">
                {aboutDropdownItems.map((item) => (
                  <DropdownMenuItem key={item.label} asChild>
                    <Link to={item.href}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Academy - simple link */}
          <Link
            to="/academy"
            className="text-sm font-normal text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-2 rounded-lg transition-colors"
          >
            Academy
          </Link>

          {/* Features - dropdown with clickable trigger */}
          <div
            onMouseEnter={() => setFeaturesOpen(true)}
            onMouseLeave={() => setFeaturesOpen(false)}
          >
            <DropdownMenu open={featuresOpen} onOpenChange={setFeaturesOpen} modal={false}>
              <DropdownMenuTrigger
                className="text-sm font-normal text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-2 rounded-lg transition-colors outline-none"
                onClick={() => navigate('/features')}
              >
                Features
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={4} className="min-w-[180px]">
                {featuresDropdownItems.map((item) => (
                  <DropdownMenuItem key={item.label} asChild>
                    <Link to={item.href}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Free Trial - simple link */}
          <Link
            to="/free-trial"
            className="text-sm font-normal text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-2 rounded-lg transition-colors"
          >
            Free Trial
          </Link>

          {/* Use Cases - dropdown */}
          <div
            onMouseEnter={() => setUseCasesOpen(true)}
            onMouseLeave={() => setUseCasesOpen(false)}
          >
            <DropdownMenu open={useCasesOpen} onOpenChange={setUseCasesOpen} modal={false}>
              <DropdownMenuTrigger className="text-sm font-normal text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-2 rounded-lg transition-colors outline-none">
                Use Cases
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={4} className="min-w-[160px]">
                {useCasesDropdownItems.map((item) => (
                  <DropdownMenuItem key={item.label} asChild>
                    <Link to={item.href}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Non Profits - dropdown */}
          <div
            onMouseEnter={() => setNonProfitsOpen(true)}
            onMouseLeave={() => setNonProfitsOpen(false)}
          >
            <DropdownMenu open={nonProfitsOpen} onOpenChange={setNonProfitsOpen} modal={false}>
              <DropdownMenuTrigger className="text-sm font-normal text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-2 rounded-lg transition-colors outline-none">
                Non Profits
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={4} className="min-w-[160px]">
                {nonProfitsDropdownItems.map((item) => (
                  <DropdownMenuItem key={item.label} asChild>
                    <Link to={item.href}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

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
          {/* Log In button - routes to /auth */}
          <button
            className="inline-flex items-center justify-center h-9 rounded-md px-3 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium"
            onClick={() => navigate('/auth')}
          >
            Log In
          </button>
          {/* Sign Up button - routes to /auth-4 */}
          <button
            className="inline-flex items-center justify-center h-9 rounded-md px-3 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium"
            onClick={() => navigate('/auth-4')}
          >
            Sign Up
          </button>
        </div>
      </div>
    </nav>
  );
}
