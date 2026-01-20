import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, Plus, ExternalLink, Command, Wallet, Building2, Calendar, DollarSign, FileText, Hash } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { Contract } from "@/types/contracts";
import { formatCurrency, formatContractDate } from "@/hooks/useContractsSearch";

const ContractDetail = () => {
  const navigate = useNavigate();
  const { contractId } = useParams<{ contractId: string }>();
  const [contractChats, setContractChats] = useState<Array<{ id: string; title: string; created_at: string }>>([]);

  // Fetch contract data
  const { data: contract, isLoading, error } = useQuery({
    queryKey: ['contract', contractId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Contracts')
        .select('*')
        .eq('id', contractId)
        .single();

      if (error) throw error;
      return data as Contract;
    },
    enabled: !!contractId,
  });

  // Fetch contract-related chats (by title pattern matching)
  useEffect(() => {
    const fetchContractChats = async () => {
      if (!contract) return;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Search for chats that mention this contract's vendor name
        const { data, error } = await supabase
          .from("chat_sessions")
          .select("id, title, created_at")
          .eq("user_id", user.id)
          .ilike("title", `%${contract.vendor_name || ''}%`)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setContractChats(data);
        }
      } catch (error) {
        console.error("Error fetching contract chats:", error);
      }
    };

    fetchContractChats();
  }, [contract]);

  const formatNoteDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleNewChat = async () => {
    if (!contract) return;
    const vendor = contract.vendor_name || 'this vendor';
    const dept = contract.department_facility ? ` for ${contract.department_facility}` : '';
    const amount = contract.current_contract_amount
      ? ` worth ${formatCurrency(contract.current_contract_amount)}`
      : '';
    const desc = contract.contract_description
      ? ` The contract description says: "${contract.contract_description}".`
      : '';

    const initialPrompt = `Tell me about the contract with ${vendor}${dept}${amount}.${desc} What should I know about this contract?`;
    navigate(`/new-chat?prompt=${encodeURIComponent(initialPrompt)}`);
  };

  const handleBack = () => {
    navigate('/contracts');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-10 w-40 bg-muted rounded animate-pulse" />
          <div className="h-48 bg-muted rounded-xl animate-pulse" />
          <div className="h-32 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Button variant="outline" onClick={handleBack} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contracts
          </Button>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Contract not found.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Section */}
        <div className="pb-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Contracts</span>
            <span className="sm:hidden">Back</span>
          </Button>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <ThemeToggle />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Toggle theme
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  onClick={() => {
                    const event = new KeyboardEvent('keydown', {
                      key: 'k',
                      metaKey: true,
                      ctrlKey: true,
                      bubbles: true
                    });
                    document.dispatchEvent(event);
                  }}
                >
                  <Command className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Command menu
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Contract Header Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <ContractInformation contract={contract} />
          </CardContent>
        </Card>

        {/* Contract Chats Section */}
        <Card className="bg-card rounded-xl shadow-sm border">
          <CardHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg font-semibold">
                  Contract Chats
                </CardTitle>
                {contractChats.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {contractChats.length} {contractChats.length === 1 ? 'chat' : 'chats'}
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewChat}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                New Chat
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {contractChats.length === 0 ? (
              <div className="bg-muted/30 rounded-lg p-4 text-sm">
                <span className="text-muted-foreground italic">No chats yet. Start a conversation about this contract.</span>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {contractChats.map((chat) => (
                  <AccordionItem key={chat.id} value={chat.id} className="border-b last:border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center gap-3 text-left">
                        <span className="text-xs text-muted-foreground">
                          {formatNoteDate(chat.created_at)}
                        </span>
                        <span className="text-sm truncate max-w-[300px]">
                          {chat.title}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/c/${chat.id}`)}
                          className="gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Open Chat
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Contract Information Component
interface ContractInformationProps {
  contract: Contract;
}

function ContractInformation({ contract }: ContractInformationProps) {
  return (
    <div className="space-y-6 relative">
      {/* Contract Header with Icon */}
      <div className="pb-4 border-b">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            {contract.vendor_name || 'Unknown Vendor'}
          </h1>
        </div>
      </div>

      {/* Description if available */}
      {contract.contract_description && (
        <div className="text-muted-foreground text-sm leading-relaxed">
          {contract.contract_description}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Contract Number */}
          {contract.contract_number && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <Hash className="h-4 w-4" />
                <span>Contract Number</span>
              </div>
              <div className="text-muted-foreground ml-6">
                {contract.contract_number}
              </div>
            </div>
          )}

          {/* Department */}
          {contract.department_facility && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <Building2 className="h-4 w-4" />
                <span>Department</span>
              </div>
              <div className="text-muted-foreground ml-6">
                {contract.department_facility}
              </div>
            </div>
          )}

          {/* Contract Type */}
          {contract.contract_type && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <FileText className="h-4 w-4" />
                <span>Contract Type</span>
              </div>
              <div className="text-muted-foreground ml-6">
                {contract.contract_type}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Contract Amount */}
          {contract.current_contract_amount && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <DollarSign className="h-4 w-4" />
                <span>Contract Amount</span>
              </div>
              <div className="text-muted-foreground ml-6">
                {formatCurrency(contract.current_contract_amount)}
              </div>
            </div>
          )}

          {/* Spending to Date */}
          {contract.spending_to_date && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <DollarSign className="h-4 w-4" />
                <span>Spending to Date</span>
              </div>
              <div className="text-muted-foreground ml-6">
                {contract.spending_to_date}
              </div>
            </div>
          )}

          {/* Contract Start Date */}
          {contract.contract_start_date && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <Calendar className="h-4 w-4" />
                <span>Start Date</span>
              </div>
              <div className="text-muted-foreground ml-6">
                {formatContractDate(contract.contract_start_date)}
              </div>
            </div>
          )}

          {/* Contract End Date */}
          {contract.contract_end_date && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <Calendar className="h-4 w-4" />
                <span>End Date</span>
              </div>
              <div className="text-muted-foreground ml-6">
                {formatContractDate(contract.contract_end_date)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Approval Date */}
      {contract.original_contract_approved_file_date && (
        <div className="space-y-2 pt-4 border-t">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <Calendar className="h-4 w-4" />
            <span>Original Approval Date</span>
          </div>
          <div className="text-muted-foreground ml-6">
            {formatContractDate(contract.original_contract_approved_file_date)}
          </div>
        </div>
      )}
    </div>
  );
}

export default ContractDetail;
