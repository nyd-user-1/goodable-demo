import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
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
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { generateMemberSlug } from '@/utils/memberSlug';
import { generateCommitteeSlug } from '@/utils/committeeSlug';

interface Member {
  people_id: number;
  name: string;
  first_name: string;
  last_name: string;
  party: string;
  chamber: string;
  photo_url: string | null;
}

interface Committee {
  committee_id: number;
  committee_name: string;
  chamber: string;
  slug: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch data when palette opens
  useEffect(() => {
    if (open && members.length === 0) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all members (sorted by first name A-Z)
      const { data: membersData } = await supabase
        .from('People')
        .select('people_id, name, first_name, last_name, party, chamber, photo_url')
        .not('chamber', 'is', null)
        .not('name', 'is', null)
        .order('first_name', { ascending: true });

      if (membersData) {
        setMembers(membersData);
      }

      // Fetch all committees
      const { data: committeesData } = await supabase
        .from('Committees')
        .select('committee_id, committee_name, chamber, slug')
        .order('committee_name', { ascending: true });

      if (committeesData) {
        setCommittees(committeesData);
      }
    } catch (error) {
      console.error('Error fetching command palette data:', error);
    } finally {
      setLoading(false);
    }
  };

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
            <span>All Bills</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => navigate('/members'))}
          >
            <Users className="mr-2 h-4 w-4" />
            <span>All Members</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => navigate('/committees'))}
          >
            <Building className="mr-2 h-4 w-4" />
            <span>All Committees</span>
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
        </CommandGroup>

        <CommandSeparator />

        {/* Member Pages */}
        <CommandGroup heading="Member Pages">
          {loading ? (
            <CommandItem disabled>Loading members...</CommandItem>
          ) : (
            members.map((member) => (
              <CommandItem
                key={member.people_id}
                onSelect={() => runCommand(() => navigate(`/members/${generateMemberSlug(member)}`))}
              >
                {member.photo_url ? (
                  <img
                    src={member.photo_url}
                    alt={member.name}
                    className="mr-2 h-5 w-5 rounded-full object-cover"
                  />
                ) : (
                  <User className="mr-2 h-5 w-5" />
                )}
                <span>{member.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {member.party} - {member.chamber}
                </span>
              </CommandItem>
            ))
          )}
        </CommandGroup>

        <CommandSeparator />

        {/* Committee Pages */}
        <CommandGroup heading="Committee Pages">
          {loading ? (
            <CommandItem disabled>Loading committees...</CommandItem>
          ) : (
            committees.map((committee) => (
              <CommandItem
                key={committee.committee_id}
                onSelect={() => runCommand(() => navigate(`/committees/${generateCommitteeSlug(committee as any)}`))}
              >
                <img
                  src={committee.chamber.toLowerCase().includes('assembly')
                    ? '/nys-assembly-seal.png'
                    : '/nys-senate-seal.png'}
                  alt={committee.chamber}
                  className="mr-2 h-5 w-5 rounded-full object-cover"
                />
                <span>{committee.chamber} {committee.committee_name}</span>
              </CommandItem>
            ))
          )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
