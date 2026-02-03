
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tables } from "@/integrations/supabase/types";
import { DashboardBillsTable } from "./DashboardBillsTable";
import { MembersTable } from "./MembersTable";
import { CommitteesTable } from "./CommitteesTable";

type Bill = Tables<"Bills"> & {
  sponsors?: Array<{
    name: string | null;
    party: string | null;
    chamber: string | null;
  }>;
};

interface DashboardTabsSectionProps {
  bills: Bill[];
}

export const DashboardTabsSection = ({ bills }: DashboardTabsSectionProps) => {
  return (
      <Card className="dashboard-table-container">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg">Table</CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <Tabs defaultValue="bill" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="bill">Bills</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="committees">Committees</TabsTrigger>
            </TabsList>

            <TabsContent value="bill" className="mt-6">
              <DashboardBillsTable />
            </TabsContent>

            <TabsContent value="members" className="mt-6">
              <MembersTable limit={10} />
            </TabsContent>

            <TabsContent value="committees" className="mt-6">
              <CommitteesTable limit={10} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
  );
};
