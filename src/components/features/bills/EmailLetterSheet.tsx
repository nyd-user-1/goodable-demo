/**
 * EmailLetterSheet Component
 * Modal for sending advocacy letters to bill sponsors via email
 */

import { useState, useEffect, ReactNode } from "react";
import { Mail, Users, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Sponsor {
  people_id: number;
  position: number;
  person?: {
    name: string | null;
    email: string | null;
    party: string | null;
    chamber: string | null;
  };
}

interface EmailLetterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  billNumber: string;
  billTitle: string;
  messageContent: ReactNode;
}

export function EmailLetterSheet({
  isOpen,
  onClose,
  billNumber,
  billTitle,
  messageContent,
}: EmailLetterSheetProps) {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(false);
  const [ccCoSponsors, setCcCoSponsors] = useState(false);
  const [subject, setSubject] = useState("");
  const [letterBody, setLetterBody] = useState("");

  // Extract text from ReactNode
  const extractText = (node: ReactNode): string => {
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(extractText).join('');
    if (node && typeof node === 'object' && 'props' in node) {
      return extractText(node.props.children);
    }
    return '';
  };

  // Fetch sponsors when sheet opens
  useEffect(() => {
    if (isOpen && billNumber) {
      fetchSponsors();
      setSubject(`Support for ${billNumber} - ${billTitle}`);
      setLetterBody(extractText(messageContent));
    }
  }, [isOpen, billNumber]);

  const fetchSponsors = async () => {
    setLoading(true);
    try {
      // First get the bill_id from bill_number
      const { data: billData } = await supabase
        .from("Bills")
        .select("bill_id")
        .eq("bill_number", billNumber)
        .single();

      if (!billData) {
        console.error("Bill not found:", billNumber);
        setLoading(false);
        return;
      }

      // Fetch sponsors for this bill
      const { data: sponsorsData } = await supabase
        .from("Sponsors")
        .select("*")
        .eq("bill_id", billData.bill_id)
        .order("position");

      if (sponsorsData && sponsorsData.length > 0) {
        // Fetch people data for sponsors
        const peopleIds = sponsorsData.map(s => s.people_id).filter(Boolean);

        if (peopleIds.length > 0) {
          const { data: peopleData } = await supabase
            .from("People")
            .select("people_id, name, email, party, chamber")
            .in("people_id", peopleIds);

          const sponsorsWithPeople = sponsorsData.map(sponsor => ({
            ...sponsor,
            person: peopleData?.find(p => p.people_id === sponsor.people_id)
          }));

          setSponsors(sponsorsWithPeople);
        } else {
          setSponsors(sponsorsData);
        }
      }
    } catch (error) {
      console.error("Error fetching sponsors:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get primary sponsor and co-sponsors
  const primarySponsor = sponsors.find(s => s.position === 1);
  const coSponsors = sponsors.filter(s => s.position > 1 && s.person?.email);

  // Generate mailto link (using encodeURIComponent to avoid + for spaces)
  const generateMailtoLink = () => {
    const to = primarySponsor?.person?.email || "";
    const cc = ccCoSponsors
      ? coSponsors.map(s => s.person?.email).filter(Boolean).join(",")
      : "";

    const params: string[] = [];
    if (cc) params.push(`cc=${encodeURIComponent(cc)}`);
    params.push(`subject=${encodeURIComponent(subject)}`);
    params.push(`body=${encodeURIComponent(letterBody)}`);

    const queryString = params.join("&");
    return `mailto:${to}?${queryString}`;
  };

  const handleOpenEmailClient = () => {
    const mailtoLink = generateMailtoLink();
    window.location.href = mailtoLink;
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email to Sponsor
          </SheetTitle>
          <SheetDescription>
            Send your letter to the bill sponsor via your email client
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !primarySponsor?.person?.email ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              No sponsor email address available for this bill.
            </p>
          </div>
        ) : (
          <div className="space-y-6 mt-6">
            {/* To Field */}
            <div className="space-y-2">
              <Label>To (Primary Sponsor)</Label>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {primarySponsor.person.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {primarySponsor.person.email}
                  </p>
                </div>
                {primarySponsor.person.party && (
                  <Badge variant="outline" className="text-xs">
                    {primarySponsor.person.party}
                  </Badge>
                )}
              </div>
            </div>

            {/* CC Co-Sponsors */}
            {coSponsors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cc-cosponsors"
                    checked={ccCoSponsors}
                    onCheckedChange={(checked) => setCcCoSponsors(checked === true)}
                  />
                  <Label
                    htmlFor="cc-cosponsors"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Users className="h-4 w-4" />
                    CC all co-sponsors ({coSponsors.length})
                  </Label>
                </div>
                {ccCoSponsors && (
                  <div className="ml-6 p-3 bg-muted/30 rounded-lg max-h-32 overflow-y-auto">
                    <div className="space-y-1">
                      {coSponsors.map((sponsor) => (
                        <p key={sponsor.people_id} className="text-xs text-muted-foreground">
                          {sponsor.person?.name} ({sponsor.person?.email})
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject..."
              />
            </div>

            {/* Letter Body */}
            <div className="space-y-2">
              <Label htmlFor="letter-body">Letter</Label>
              <Textarea
                id="letter-body"
                value={letterBody}
                onChange={(e) => setLetterBody(e.target.value)}
                className="min-h-[200px] text-sm"
                placeholder="Your letter content..."
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-4">
              <Button onClick={handleOpenEmailClient} className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in Email Client
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                This will open your default email application with the letter pre-filled
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
