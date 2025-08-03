import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ModelSelector } from "@/components/ModelSelector";
import { useModel } from "@/contexts/ModelContext";

interface SidebarFooterProps {
  collapsed: boolean;
}

export function SidebarFooter({ collapsed }: SidebarFooterProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { selectedModel, setSelectedModel } = useModel();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const getDisplayName = () => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.user_metadata?.username) return user.user_metadata.username;
    return user?.email?.split('@')[0] || 'User';
  };

  return (
    <div className="space-y-3">
      {/* Theme and Model Controls */}
      {!collapsed && (
        <div className="flex items-center gap-2 px-2">
          <ThemeToggle />
          <ModelSelector 
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
        </div>
      )}
      
      {/* User Profile */}
      <div className="flex items-center space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.user_metadata?.avatar_url} alt="Profile picture" />
          <AvatarFallback>
            {user ? getInitials(user.email || '') : 'U'}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{getDisplayName()}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || 'user@example.com'}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="h-8 w-8 p-0"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}