import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Copy, ThumbsUp, ThumbsDown, Trash2, Sparkles, Mail, Phone, MapPin, ExternalLink, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useAllFavorites } from "@/hooks/useAllFavorites";
import { Badge } from "@/components/ui/badge";
import { AIChatSheet } from "@/components/AIChatSheet";

type Bill = Tables<"Bills"> & {
  sponsors?: Array<{
    name: string | null;
    party: string | null;
    chamber: string | null;
  }>;
};

type Member = Tables<"People">;
type Committee = Tables<"Committees">;

const Favorites = () => {
  const {
    favoriteBills,
    favoriteMembers,
    favoriteCommittees,
    loading,
    removeBillFavorite,
    removeMemberFavorite,
    removeCommitteeFavorite
  } = useAllFavorites();
  
  const { toast } = useToast();
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedBillForChat, setSelectedBillForChat] = useState<Bill | null>(null);
  const [selectedMemberForChat, setSelectedMemberForChat] = useState<Member | null>(null);
  const [selectedCommitteeForChat, setSelectedCommitteeForChat] = useState<{
    committee_id: number;
    name: string;
    chamber: string;
    description?: string;
  } | null>(null);

  const handleBillAIAnalysis = (bill: Bill, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBillForChat(bill);
    setSelectedMemberForChat(null);
    setChatOpen(true);
  };

  const handleMemberAIAnalysis = (member: Member, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMemberForChat(member);
    setSelectedBillForChat(null);
    setSelectedCommitteeForChat(null);
    setChatOpen(true);
  };

  const handleCommitteeAIAnalysis = (committee: Committee, e: React.MouseEvent) => {
    e.stopPropagation();
    // Convert the committee to the format expected by AIChatSheet
    const chatCommittee = {
      committee_id: committee.committee_id,
      name: committee.committee_name || "",
      chamber: committee.chamber || "",
      description: committee.description || ""
    };
    setSelectedCommitteeForChat(chatCommittee);
    setSelectedBillForChat(null);
    setSelectedMemberForChat(null);
    setChatOpen(true);
  };

  const handleRemoveBillFavorite = async (billId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeBillFavorite(billId);
  };

  const handleRemoveMemberFavorite = async (memberId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeMemberFavorite(memberId);
  };

  const handleRemoveCommitteeFavorite = async (committeeId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeCommitteeFavorite(committeeId);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Content copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleFeedback = (type: "thumbs-up" | "thumbs-down") => {
    toast({
      title: "Feedback recorded",
      description: `Thank you for your ${type === "thumbs-up" ? "positive" : "negative"} feedback`
    });
  };

  const getStatusBadgeVariant = (status: string | null) => {
    if (!status) return "secondary";
    const lowercaseStatus = status.toLowerCase();
    if (lowercaseStatus.includes("passed") || lowercaseStatus.includes("signed")) return "default";
    if (lowercaseStatus.includes("committee")) return "outline";
    if (lowercaseStatus.includes("withdrawn") || lowercaseStatus.includes("died")) return "destructive";
    return "secondary";
  };

  const getPartyColor = (party: string | null) => {
    if (!party) return "bg-muted text-muted-foreground";
    const partyLower = party.toLowerCase();
    if (partyLower.includes("democrat") || partyLower.includes("democratic")) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
    if (partyLower.includes("republican")) {
      return "bg-red-100 text-red-800 border-red-200";
    }
    if (partyLower.includes("independent")) {
      return "bg-purple-100 text-purple-800 border-purple-200";
    }
    return "bg-muted text-muted-foreground";
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Favorites</h1>
            <p className="text-muted-foreground">Your favorite bills and members</p>
          </div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-1/3"></div>
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalFavorites = favoriteBills.length + favoriteMembers.length + favoriteCommittees.length;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Favorites</h1>
          <p className="text-muted-foreground">
            {totalFavorites === 0 
              ? "No favorites yet" 
              : `${favoriteBills.length} favorite bills, ${favoriteMembers.length} favorite members, ${favoriteCommittees.length} favorite committees`
            }
          </p>
        </div>

        {totalFavorites === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Heart className="h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
              <p className="text-muted-foreground text-center">
                Start adding bills and members to your favorites by clicking the heart icon
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="bills" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bills">Bills ({favoriteBills.length})</TabsTrigger>
              <TabsTrigger value="members">Members ({favoriteMembers.length})</TabsTrigger>
              <TabsTrigger value="committees">Committees ({favoriteCommittees.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="bills" className="space-y-4">
              {favoriteBills.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground">No favorite bills yet</p>
                  </CardContent>
                </Card>
              ) : (
                favoriteBills.map(favorite => {
                  const bill = favorite.bill;
                  return (
                    <Card key={favorite.id} className="w-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                              <CardTitle className="text-lg">{bill.bill_number || "No Number"}</CardTitle>
                              <Badge variant={getStatusBadgeVariant(bill.status_desc)} className="text-xs">
                                {bill.status_desc || "Unknown"}
                              </Badge>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" onClick={e => e.stopPropagation()}>
                                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={e => handleBillAIAnalysis(bill, e)}>
                                  <Sparkles className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Added {format(new Date(favorite.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                              {bill.last_action_date && (
                                <span>Last action: {format(new Date(bill.last_action_date), "MMM d, yyyy")}</span>
                              )}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={e => handleRemoveBillFavorite(bill.bill_id, e)} className="hover:bg-destructive hover:text-destructive-foreground ml-4">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <Accordion type="single" collapsible>
                          <AccordionItem value="bill-content" className="border-none">
                            <AccordionTrigger className="hover:no-underline py-2">
                              <div className="text-left">
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                                  {bill.description || "No description available"}
                                </p>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <h4 className="font-medium">Bill Details</h4>
                                    <div className="text-sm space-y-1">
                                      <p><strong>Bill Number:</strong> {bill.bill_number || "N/A"}</p>
                                      <p><strong>Status:</strong> {bill.status_desc || "N/A"}</p>
                                      <p><strong>Committee:</strong> {bill.committee || "N/A"}</p>
                                      {bill.last_action && <p><strong>Last Action:</strong> {bill.last_action}</p>}
                                      {bill.last_action_date && (
                                        <p><strong>Last Action Date:</strong> {format(new Date(bill.last_action_date), "MMMM d, yyyy")}</p>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {(bill.title || bill.description) && (
                                    <div className="space-y-2">
                                      <h4 className="font-medium">Description</h4>
                                      <p className="text-sm whitespace-pre-wrap">
                                        {bill.description || bill.title || "No description available"}
                                      </p>
                                    </div>
                                  )}

                                  <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`${bill.title}\n\n${bill.description || ""}`)} className="h-8 px-2">
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleFeedback("thumbs-up")} className="h-8 px-2">
                                      <ThumbsUp className="h-3 w-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleFeedback("thumbs-down")} className="h-8 px-2">
                                      <ThumbsDown className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </ScrollArea>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="members" className="space-y-4">
              {favoriteMembers.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground">No favorite members yet</p>
                  </CardContent>
                </Card>
              ) : (
                favoriteMembers.map(favorite => {
                  const member = favorite.member;
                  return (
                    <Card key={favorite.id} className="w-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <CardTitle className="text-lg">{member.name || "Unknown Member"}</CardTitle>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Added {format(new Date(favorite.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button variant="ghost" size="sm" onClick={e => handleRemoveMemberFavorite(member.people_id, e)} className="hover:bg-destructive hover:text-destructive-foreground">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={e => handleMemberAIAnalysis(member, e)} className="hover:bg-primary/10">
                              <Sparkles className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="space-y-3">
                          {/* Party and District badges */}
                          <div className="flex items-center gap-2">
                            {member.chamber && (
                              <Badge variant="outline" className={
                                member.chamber.toLowerCase().includes('assembly') 
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : "bg-purple-100 text-purple-800 border-purple-200"
                              }>
                                {member.chamber}
                              </Badge>
                            )}
                            {member.party && (
                              <Badge variant="outline" className={`${getPartyColor(member.party)} w-fit`}>
                                {member.party.charAt(0)}
                              </Badge>
                            )}
                          </div>

                          {/* District */}
                          {member.district && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">District {member.district}</span>
                            </div>
                          )}

                          {/* Email */}
                          {member.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{member.email}</span>
                            </div>
                          )}

                          {/* Phone */}
                          {member.phone_capitol && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{member.phone_capitol}</span>
                            </div>
                          )}

                          {/* View Full Bio link */}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                            <ExternalLink className="h-4 w-4 flex-shrink-0" />
                            <span>View Full Bio</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="committees" className="space-y-4">
              {favoriteCommittees.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground">No favorite committees yet</p>
                  </CardContent>
                </Card>
              ) : (
                favoriteCommittees.map(favorite => {
                  const committee = favorite.committee;
                  return (
                    <Card key={favorite.id} className="w-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <CardTitle className="text-lg">{committee.committee_name || "Unknown Committee"}</CardTitle>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Added {format(new Date(favorite.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button variant="ghost" size="sm" onClick={e => handleRemoveCommitteeFavorite(committee.committee_id, e)} className="hover:bg-destructive hover:text-destructive-foreground">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={e => handleCommitteeAIAnalysis(committee, e)} className="hover:bg-primary/10">
                              <Sparkles className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="space-y-3">
                          {/* Chamber badge */}
                          {committee.chamber && (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={
                                committee.chamber.toLowerCase().includes('assembly') 
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : "bg-purple-100 text-purple-800 border-purple-200"
                              }>
                                {committee.chamber}
                              </Badge>
                            </div>
                          )}

                          {/* Chair */}
                          {committee.chair_name && (
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">Chair: {committee.chair_name}</span>
                            </div>
                          )}

                          {/* Meeting Schedule */}
                          {committee.meeting_schedule && (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{committee.meeting_schedule}</span>
                            </div>
                          )}

                          {/* Member Count */}
                          {committee.member_count && (
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{committee.member_count} members</span>
                            </div>
                          )}

                          {/* View Full Details link */}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                            <ExternalLink className="h-4 w-4 flex-shrink-0" />
                            <span>View Full Details</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* AI Chat Sheet */}
      <AIChatSheet 
        open={chatOpen} 
        onOpenChange={setChatOpen} 
        bill={selectedBillForChat} 
        member={selectedMemberForChat}
        committee={selectedCommitteeForChat}
      />
    </div>
  );
};

export default Favorites;