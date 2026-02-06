import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Info } from "lucide-react";
import { LobbyingClientsTable } from "./LobbyingClientsTable";
import { LobbyingIndividualLobbyists } from "./LobbyingIndividualLobbyists";
import { LobbyingSpend, LobbyistClient } from "@/types/lobbying";

// Extended type that includes spending data for each client
interface LobbyistClientWithSpending extends LobbyistClient {
  spending?: LobbyingSpend | null;
}

interface LobbyingTabsProps {
  principalLobbyistName: string;
  clients: LobbyistClientWithSpending[];
}

export const LobbyingTabs = ({ principalLobbyistName, clients }: LobbyingTabsProps) => {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-muted rounded-lg">
        <TabsTrigger value="overview" className="h-10 rounded-md text-sm font-medium">
          Overview
        </TabsTrigger>
        <TabsTrigger value="registered" className="h-10 rounded-md text-sm font-medium">
          Registered
        </TabsTrigger>
        <TabsTrigger value="clients" className="h-10 rounded-md text-sm font-medium">
          Clients
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <Card>
          <CardHeader>
            <CardTitle>Lobbyist Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8">
                <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="registered">
        <Card>
          <CardContent className="p-6">
            <LobbyingIndividualLobbyists principalLobbyistName={principalLobbyistName} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="clients">
        <Card className="bg-card rounded-xl shadow-sm border">
          <Accordion type="single" collapsible defaultValue="clients">
            <AccordionItem value="clients" className="border-0">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3 w-full">
                  <span className="text-lg font-semibold">Clients</span>
                  <Badge variant="secondary" className="text-xs">
                    {clients.length} {clients.length === 1 ? 'client' : 'clients'}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <LobbyingClientsTable clients={clients} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
