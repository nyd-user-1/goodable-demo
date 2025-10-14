import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { MessageSquare, FileText, Users, Building2, TrendingUp, Heart, Target, Gamepad2, Factory, Home, ChevronDown, User, CreditCard, Clock, Shield, Palette, Image as ImageIcon, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigation } from "@/hooks/useNavigation";
import { useAuth } from "@/contexts/AuthContext";
import { useModel } from "@/contexts/ModelContext";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

const legislationItems = [
  { title: "Bills", url: "/bills", icon: FileText },
  { title: "Committees", url: "/committees", icon: Building2 },
  { title: "Members", url: "/members", icon: Users },
  { title: "Dashboard", url: "/dashboard", icon: TrendingUp },
];

const developmentItems = [
  { title: "Explore", url: "/home", icon: Home },
  { title: "The 100", url: "/problems", icon: Target },
  { title: "Chats", url: "/chats", icon: MessageSquare },
  { title: "Favorites", url: "/favorites", icon: Heart },
  { title: "Playground", url: "/playground", icon: Gamepad2, adminOnly: true },
  { title: "Lab", url: "/policy-portal", icon: Factory, adminOnly: true },
];

const accountItems = [
  { title: "Profile", url: "/profile", icon: User },
  { title: "Plans", url: "/plans", icon: CreditCard },
  { title: "Change Log", url: "/changelog", icon: Clock },
];

const adminItems = [
  { title: "Control Panel", url: "/admin", icon: Shield },
  { title: "Design System", url: "/style-guide", icon: Palette },
  { title: "Image System", url: "/image-system", icon: ImageIcon },
];

const modelOptions = [
  { id: "gpt-4o", name: "GPT-4o", icon: "🤖" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", icon: "🤖" },
  { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", icon: "🧠" },
  { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", icon: "🧠" },
  { id: "sonar-pro", name: "Sonar Large", icon: "🔍" },
  { id: "sonar", name: "Sonar Small", icon: "🔍" },
];

export function VerticalSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLegislationOpen, setIsLegislationOpen] = useState(true);
  const [isDevelopmentOpen, setIsDevelopmentOpen] = useState(true);
  const [isModelsOpen, setIsModelsOpen] = useState(true);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const { getNavClassName } = useNavigation();
  const { isAdmin } = useAuth();
  const { selectedModel, setSelectedModel } = useModel();

  useEffect(() => {
    const root = window.document.documentElement;
    const initialTheme = root.classList.contains('dark') ? 'dark' : 'light';
    setTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    root.classList.toggle('dark');
    const newTheme = root.classList.contains('dark') ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Single Container - Button + Menu */}
      <div className="fixed top-4 left-4 w-80 bg-background border rounded-2xl z-50 overflow-hidden transition-all duration-300">
        {/* Header/Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
        >
          <span className="font-semibold text-lg">Goodable</span>
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform",
            isOpen && "rotate-180"
          )} />
        </button>

        {/* Expandable Content */}
        <div
          className={cn(
            "transition-all duration-300 overflow-hidden",
            isOpen ? "max-h-[calc(100vh-8rem)]" : "max-h-0"
          )}
        >
          <div className="overflow-y-auto p-4 pt-0 space-y-2">
          {/* New Chat - Always at top */}
          <NavLink
            to="/new-chat"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="font-medium">New chat</span>
          </NavLink>

          {/* Legislation */}
          <Collapsible open={isLegislationOpen} onOpenChange={setIsLegislationOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 hover:bg-accent rounded-lg transition-colors">
              <span className="text-sm font-medium text-muted-foreground">Legislation</span>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                isLegislationOpen && "rotate-180"
              )} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 mt-1">
              {legislationItems.map((item) => (
                <NavLink
                  key={item.title}
                  to={item.url}
                  className={cn("flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors", getNavClassName)}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm">{item.title}</span>
                </NavLink>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Development */}
          <Collapsible open={isDevelopmentOpen} onOpenChange={setIsDevelopmentOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 hover:bg-accent rounded-lg transition-colors">
              <span className="text-sm font-medium text-muted-foreground">Development</span>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                isDevelopmentOpen && "rotate-180"
              )} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 mt-1">
              {developmentItems
                .filter(item => !item.adminOnly || isAdmin)
                .map((item) => (
                  <NavLink
                    key={item.title}
                    to={item.url}
                    className={cn("flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors", getNavClassName)}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="text-sm">{item.title}</span>
                  </NavLink>
                ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Models */}
          <Collapsible open={isModelsOpen} onOpenChange={setIsModelsOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 hover:bg-accent rounded-lg transition-colors">
              <span className="text-sm font-medium text-muted-foreground">Models</span>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                isModelsOpen && "rotate-180"
              )} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 mt-1">
              {modelOptions.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors w-full text-left",
                    selectedModel === model.id && "bg-primary text-primary-foreground"
                  )}
                >
                  <span>{model.icon}</span>
                  <span className="text-sm">{model.name}</span>
                </button>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Account */}
          <Collapsible open={isAccountOpen} onOpenChange={setIsAccountOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 hover:bg-accent rounded-lg transition-colors">
              <span className="text-sm font-medium text-muted-foreground">Account</span>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                isAccountOpen && "rotate-180"
              )} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 mt-1">
              {accountItems.map((item) => (
                <NavLink
                  key={item.title}
                  to={item.url}
                  className={cn("flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors", getNavClassName)}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm">{item.title}</span>
                </NavLink>
              ))}

              {/* Theme Toggle */}
              <button
                onClick={() => toggleTheme()}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors w-full text-left"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span className="text-sm">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </button>
            </CollapsibleContent>
          </Collapsible>

          {/* Admin */}
          {isAdmin && (
            <Collapsible open={isAdminOpen} onOpenChange={setIsAdminOpen}>
              <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 hover:bg-accent rounded-lg transition-colors">
                <span className="text-sm font-medium text-muted-foreground">Admin</span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  isAdminOpen && "rotate-180"
                )} />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 mt-1">
                {adminItems.map((item) => (
                  <NavLink
                    key={item.title}
                    to={item.url}
                    className={cn("flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors", getNavClassName)}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="text-sm">{item.title}</span>
                  </NavLink>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
          </div>
        </div>
      </div>
    </>
  );
}
