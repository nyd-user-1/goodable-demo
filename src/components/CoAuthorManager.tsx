import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, UserPlus, Check, X, Crown, Edit, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type CoAuthor = Tables<"co_authors">;
type Profile = Tables<"profiles">;

interface CoAuthorManagerProps {
  draftId: string;
  isOwner: boolean;
  onCoAuthorChange?: () => void;
}

export const CoAuthorManager = ({ draftId, isOwner, onCoAuthorChange }: CoAuthorManagerProps) => {
  const [coAuthors, setCoAuthors] = useState<(CoAuthor & { profile?: Profile })[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"collaborator" | "viewer">("collaborator");
  const [_loading, _setLoading] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCoAuthors();
  }, [draftId]);

  const fetchCoAuthors = async () => {
    try {
      const { data, error } = await supabase
        .from("co_authors")
        .select("*")
        .eq("legislative_draft_id", draftId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Fetch profiles separately to avoid join issues
      const coAuthorsWithProfiles = await Promise.all(
        (data || []).map(async (coAuthor) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", coAuthor.user_id)
            .single();
          
          return { ...coAuthor, profile };
        })
      );
      
      setCoAuthors(coAuthorsWithProfiles);
    } catch (error) {
    }
  };

  const inviteCoAuthor = async () => {
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      // First, find the user by email through their profile
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("display_name", inviteEmail)
        .single();

      if (profileError || !profiles) {
        toast({
          title: "User not found",
          description: "No user found with that email address.",
          variant: "destructive",
        });
        return;
      }

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("co_authors")
        .insert({
          legislative_draft_id: draftId,
          user_id: profiles.user_id,
          invited_by: user.user.id,
          role: inviteRole,
          status: "pending"
        });

      if (error) throw error;

      setInviteEmail("");
      setInviteRole("collaborator");
      fetchCoAuthors();
      onCoAuthorChange?.();

      toast({
        title: "Invitation sent",
        description: "Co-author invitation has been sent successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error sending invitation",
        description: error.message || "Failed to send co-author invitation.",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const updateCoAuthorStatus = async (coAuthorId: string, status: "accepted" | "declined") => {
    try {
      const { error } = await supabase
        .from("co_authors")
        .update({ 
          status,
          accepted_at: status === "accepted" ? new Date().toISOString() : null
        })
        .eq("id", coAuthorId);

      if (error) throw error;

      fetchCoAuthors();
      onCoAuthorChange?.();

      toast({
        title: `Invitation ${status}`,
        description: `Co-author invitation has been ${status}.`,
      });
    } catch (error) {
      toast({
        title: "Error updating invitation",
        description: "Failed to update co-author invitation.",
        variant: "destructive",
      });
    }
  };

  const removeCoAuthor = async (coAuthorId: string) => {
    try {
      const { error } = await supabase
        .from("co_authors")
        .delete()
        .eq("id", coAuthorId);

      if (error) throw error;

      fetchCoAuthors();
      onCoAuthorChange?.();

      toast({
        title: "Co-author removed",
        description: "Co-author has been removed from the draft.",
      });
    } catch (error) {
      toast({
        title: "Error removing co-author",
        description: "Failed to remove co-author.",
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner": return Crown;
      case "collaborator": return Edit;
      case "viewer": return Eye;
      default: return Users;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner": return "default";
      case "collaborator": return "secondary";
      case "viewer": return "outline";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted": return "default";
      case "pending": return "secondary";
      case "declined": return "destructive";
      default: return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Co-Authors ({coAuthors.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isOwner && (
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium text-sm">Invite Co-Author</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1"
              />
              <Select value={inviteRole} onValueChange={(value: "collaborator" | "viewer") => setInviteRole(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="collaborator">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={inviteCoAuthor} 
                disabled={isInviting || !inviteEmail.trim()}
                size="sm"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {coAuthors.map((coAuthor) => {
            const RoleIcon = getRoleIcon(coAuthor.role || "viewer");
            return (
              <div key={coAuthor.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    {coAuthor.profile?.avatar_url && (
                      <AvatarImage src={coAuthor.profile.avatar_url} />
                    )}
                    <AvatarFallback className="text-xs">
                      {coAuthor.profile?.display_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {coAuthor.profile?.display_name || "Unknown User"}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant={getRoleColor(coAuthor.role || "viewer")} className="text-xs">
                        <RoleIcon className="h-3 w-3 mr-1" />
                        {coAuthor.role}
                      </Badge>
                      <Badge variant={getStatusColor(coAuthor.status || "pending")} className="text-xs">
                        {coAuthor.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {coAuthor.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateCoAuthorStatus(coAuthor.id, "accepted")}
                        className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateCoAuthorStatus(coAuthor.id, "declined")}
                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {isOwner && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeCoAuthor(coAuthor.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

          {coAuthors.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No co-authors yet</p>
              {isOwner && (
                <p className="text-xs">Invite collaborators to work together on this draft</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};