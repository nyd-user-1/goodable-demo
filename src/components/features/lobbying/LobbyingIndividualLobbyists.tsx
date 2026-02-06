import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Phone, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Type for Individual Lobbyist from the new table
interface IndividualLobbyist {
  principal_lobbyist_name: string | null;
  individual_lobbyist: string | null;
  address: string | null;
  address_2: string | null;
  city: string | null;
  state: string | null;
  phone_number: string | null;
}

interface LobbyingIndividualLobbyistsProps {
  principalLobbyistName: string;
}

// Normalize name from "LAST, FIRST" to "First Last" with proper title case
const normalizeName = (name: string | null): string => {
  if (!name) return "Unknown";

  // Check if name is in "LAST, FIRST" format
  if (name.includes(",")) {
    const parts = name.split(",").map(p => p.trim());
    if (parts.length >= 2) {
      const lastName = parts[0];
      const firstName = parts[1];
      // Convert to title case
      const toTitleCase = (str: string) =>
        str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
      return `${toTitleCase(firstName)} ${toTitleCase(lastName)}`;
    }
  }

  // If not in "LAST, FIRST" format, just title case the whole thing
  return name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
};

export const LobbyingIndividualLobbyists = ({ principalLobbyistName }: LobbyingIndividualLobbyistsProps) => {
  const [lobbyists, setLobbyists] = useState<IndividualLobbyist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIndividualLobbyists = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("Individual_Lobbyists")
          .select("*")
          .ilike("principal_lobbyist_name", `%${principalLobbyistName}%`);

        if (error) {
          console.error("Error fetching individual lobbyists:", error);
          setLobbyists([]);
          return;
        }

        setLobbyists(data || []);
      } catch (error) {
        console.error("Error fetching individual lobbyists:", error);
        setLobbyists([]);
      } finally {
        setLoading(false);
      }
    };

    if (principalLobbyistName) {
      fetchIndividualLobbyists();
    } else {
      setLoading(false);
    }
  }, [principalLobbyistName]);

  return (
    <div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : lobbyists.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No individual lobbyists found for this principal lobbyist.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
              {lobbyists.map((lobbyist, index) => (
                <div
                  key={index}
                  className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-sm">
                      {normalizeName(lobbyist.individual_lobbyist)}
                    </h4>
                    {lobbyist.phone_number && (
                      <a
                        href={`tel:${lobbyist.phone_number}`}
                        className="p-1.5 rounded-md hover:bg-muted transition-colors"
                        title="Click to call"
                      >
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      </a>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {(lobbyist.address || lobbyist.address_2 || lobbyist.city) && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          {lobbyist.address && <div>{lobbyist.address}</div>}
                          {lobbyist.address_2 && <div>{lobbyist.address_2}</div>}
                          {(lobbyist.city || lobbyist.state) && (
                            <div>{[lobbyist.city, lobbyist.state].filter(Boolean).join(", ")}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
    </div>
  );
};
