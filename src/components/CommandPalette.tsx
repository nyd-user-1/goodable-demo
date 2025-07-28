import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Home,
  LayoutDashboard,
  FileText,
  Users,
  Building,
  MessageSquare,
  Heart,
  User,
  Settings,
  Search,
  PlusCircle,
  History,
  Lightbulb,
  CreditCard,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {/* Navigation */}
        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => runCommand(() => navigate('/'))}
          >
            <Home className="mr-2 h-4 w-4" />
            <span>Home</span>
          </CommandItem>
          {user && (
            <>
              <CommandItem
                onSelect={() => runCommand(() => navigate('/dashboard'))}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => navigate('/bills'))}
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>Bills</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => navigate('/members'))}
              >
                <Users className="mr-2 h-4 w-4" />
                <span>Members</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => navigate('/committees'))}
              >
                <Building className="mr-2 h-4 w-4" />
                <span>Committees</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => navigate('/chats'))}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>Chat History</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => navigate('/favorites'))}
              >
                <Heart className="mr-2 h-4 w-4" />
                <span>Favorites</span>
              </CommandItem>
            </>
          )}
        </CommandGroup>

        <CommandSeparator />

        {/* Actions */}
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => runCommand(() => {
              const event = new CustomEvent('open-problem-chat');
              window.dispatchEvent(event);
            })}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>New Problem Statement</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => navigate('/playground'))}
          >
            <Lightbulb className="mr-2 h-4 w-4" />
            <span>AI Playground</span>
          </CommandItem>
          {user && (
            <CommandItem
              onSelect={() => runCommand(() => navigate('/policy-portal'))}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>Policy Portal</span>
            </CommandItem>
          )}
        </CommandGroup>

        <CommandSeparator />

        {/* User */}
        <CommandGroup heading="User">
          {user ? (
            <>
              <CommandItem
                onSelect={() => runCommand(() => navigate('/profile'))}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => navigate('/plans'))}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Subscription Plans</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => signOut())}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </CommandItem>
            </>
          ) : (
            <CommandItem
              onSelect={() => runCommand(() => navigate('/auth'))}
            >
              <User className="mr-2 h-4 w-4" />
              <span>Sign In</span>
            </CommandItem>
          )}
        </CommandGroup>

        {/* Quick Search */}
        <CommandSeparator />
        <CommandGroup heading="Quick Search">
          <CommandItem
            onSelect={() => runCommand(() => {
              navigate('/bills');
              setTimeout(() => {
                const searchInput = document.querySelector('input[placeholder*="Search bills"]') as HTMLInputElement;
                searchInput?.focus();
              }, 100);
            })}
          >
            <Search className="mr-2 h-4 w-4" />
            <span>Search Bills</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => {
              navigate('/members');
              setTimeout(() => {
                const searchInput = document.querySelector('input[placeholder*="Search members"]') as HTMLInputElement;
                searchInput?.focus();
              }, 100);
            })}
          >
            <Search className="mr-2 h-4 w-4" />
            <span>Search Members</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => {
              navigate('/committees');
              setTimeout(() => {
                const searchInput = document.querySelector('input[placeholder*="Search committees"]') as HTMLInputElement;
                searchInput?.focus();
              }, 100);
            })}
          >
            <Search className="mr-2 h-4 w-4" />
            <span>Search Committees</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}