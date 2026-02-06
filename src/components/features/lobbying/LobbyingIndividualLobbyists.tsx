import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Users, Phone, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Type for Individual Lobbyist from the new table
interface IndividualLobbyist {
  "Principal Lobbyist Name": string | null;
  "Individual Lobbyist": string | null;
  "Address": string | null;
  "Address 2": string | null;
  "City": string | null;
  "State": string | null;
  "Phone Number": string | null;
}

interface LobbyingIndividualLobbyistsProps {
  principalLobbyistName: string;
}

export const LobbyingIndividualLobbyists = ({ principalLobbyistName }: LobbyingIndividualLobbyistsProps) => {
  const [lobbyists, setLobbyists] = useState<IndividualLobbyist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIndividualLobbyists = async () => {
      setLoading(true);
      try {
        // Query the Individual_Lobbyists table by principal lobbyist name
        const { data, error } = await supabase
          .from("Individual_Lobbyists")
          .select("*")
          .ilike("Principal Lobbyist Name", `%${principalLobbyistName}%`);

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

  // Format address from components
  const formatAddress = (lobbyist: IndividualLobbyist): string | null => {
    const parts = [
      lobbyist["Address"],
      lobbyist["Address 2"],
      lobbyist["City"],
      lobbyist["State"]
    ].filter(Boolean);

    if (parts.length === 0) return null;

    // Format as: Address, Address 2, City, State
    let address = lobbyist["Address"] || "";
    if (lobbyist["Address 2"]) address += `, ${lobbyist["Address 2"]}`;
    if (lobbyist["City"] || lobbyist["State"]) {
      address += `, ${[lobbyist["City"], lobbyist["State"]].filter(Boolean).join(", ")}`;
    }
    return address;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Registered Lobbyists</h2>
        <Badge variant="secondary" className="text-xs">
          {loading ? '...' : `${lobbyists.length} ${lobbyists.length === 1 ? 'Lobbyist' : 'Lobbyists'}`}
        </Badge>
      </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lobbyists.map((lobbyist, index) => {
              const address = formatAddress(lobbyist);
              return (
                <div
                  key={index}
                  className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">
                        {lobbyist["Individual Lobbyist"] || "Unknown Lobbyist"}
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-muted-foreground">
                    {lobbyist["Phone Number"] && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 flex-shrink-0" />
                        <span>{lobbyist["Phone Number"]}</span>
                      </div>
                    )}
                    {address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{address}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
