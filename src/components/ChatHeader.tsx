import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import confetti from "canvas-confetti";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { NoteViewSidebar } from "@/components/NoteViewSidebar";


interface ChatHeaderProps {
  onNewChat?: () => void;
  onWhatIsGoodable?: () => void;
  onOpenSidebar?: () => void;
}

// Nav items configuration
const NAV_ITEMS = [
  { to: "/", label: "Chat" },
  { to: "/prompts", label: "Prompts" },
  { to: "/lists", label: "Lists" },
];

export function ChatHeader({ onNewChat, onWhatIsGoodable, onOpenSidebar }: ChatHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  // Self-managed sidebar (used when no onOpenSidebar prop is provided)
  const [internalSidebarOpen, setInternalSidebarOpen] = useState(false);
  const [sidebarMounted, setSidebarMounted] = useState(false);
  const manageOwnSidebar = !onOpenSidebar;

  // Sliding indicator state
  const navRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, transform: "translateX(0px)" });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (manageOwnSidebar) {
      setSidebarMounted(true);
    }
  }, [manageOwnSidebar]);

  const handleOpenSidebar = onOpenSidebar ?? (() => setInternalSidebarOpen(true));

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

  // Calculate indicator position based on target element
  const updateIndicator = useCallback((element: HTMLElement | null) => {
    if (!element || !navRef.current) return;

    const navRect = navRef.current.getBoundingClientRect();
    const tabRect = element.getBoundingClientRect();

    // Calculate position relative to nav container
    const offsetX = tabRect.left - navRect.left;

    setIndicatorStyle({
      width: tabRect.width,
      transform: `translateX(${offsetX}px)`,
    });
  }, []);

  // Set initial indicator position on active tab
  useEffect(() => {
    const activeIndex = NAV_ITEMS.findIndex(item =>
      item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to)
    );
    if (activeIndex !== -1 && tabRefs.current[activeIndex]) {
      updateIndicator(tabRefs.current[activeIndex]);
    }
  }, [location.pathname, updateIndicator]);

  // Handle mouse enter on a tab
  const handleTabHover = (index: number) => {
    setIsHovering(true);
    updateIndicator(tabRefs.current[index]);
  };

  // Handle mouse leave from nav - return to active tab
  const handleNavLeave = () => {
    setIsHovering(false);
    const activeIndex = NAV_ITEMS.findIndex(item =>
      item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to)
    );
    if (activeIndex !== -1 && tabRefs.current[activeIndex]) {
      updateIndicator(tabRefs.current[activeIndex]);
    }
  };

  return (
    <>
      {/* Self-managed sidebar */}
      {manageOwnSidebar && (
        <>
          <div
            className={cn(
              "fixed left-0 top-0 bottom-0 w-[85vw] max-w-sm md:w-72 bg-background border-r z-[60]",
              sidebarMounted && "transition-transform duration-300 ease-in-out",
              internalSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <NoteViewSidebar onClose={() => setInternalSidebarOpen(false)} />
          </div>
          {internalSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/20 z-50 transition-opacity"
              onClick={() => setInternalSidebarOpen(false)}
            />
          )}
        </>
      )}

      <nav className="fixed top-0 left-0 right-0 z-50 px-5 py-2 bg-background/80 backdrop-blur-md">
        <div className="flex items-center justify-between">
          {/* Left side - Logs menu icon */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handleOpenSidebar}
              className="inline-flex items-center justify-center h-10 w-10 rounded-md text-foreground hover:bg-muted transition-colors"
              aria-label="Open menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 5h1"/><path d="M3 12h1"/><path d="M3 19h1"/>
                <path d="M8 5h1"/><path d="M8 12h1"/><path d="M8 19h1"/>
                <path d="M13 5h8"/><path d="M13 12h8"/><path d="M13 19h8"/>
              </svg>
            </button>
          </div>

          {/* Center - Navigation with sliding indicator (desktop only) */}
          <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
            <div
              ref={navRef}
              className="relative flex items-center"
              onMouseLeave={handleNavLeave}
            >
              {/* Sliding indicator - single element that moves between tabs */}
              <div
                className={cn(
                  "absolute top-0 left-0 h-full rounded-lg bg-muted pointer-events-none",
                  "transition-all duration-200 ease-out"
                )}
                style={{
                  width: indicatorStyle.width,
                  transform: indicatorStyle.transform,
                  opacity: indicatorStyle.width > 0 ? 1 : 0,
                }}
              />

              {/* Tab links - no individual hover backgrounds */}
              {NAV_ITEMS.map((item, index) => (
                <Link
                  key={item.to}
                  ref={(el) => { tabRefs.current[index] = el; }}
                  to={item.to}
                  onMouseEnter={() => handleTabHover(index)}
                  onFocus={() => handleTabHover(index)}
                  className={cn(
                    "relative z-10 text-sm font-normal px-3 py-2 rounded-lg transition-colors min-w-[160px] text-center",
                    // Active state based on current route
                    (item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to))
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side - Controls */}
          <div className="flex items-center gap-2">
            {/* NYSgpt button */}
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
          </div>
        </div>
      </nav>
    </>
  );
}
