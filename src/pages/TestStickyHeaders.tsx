import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DashboardBillsTable } from '@/components/features/dashboard/DashboardBillsTable';
import { MembersTable } from '@/components/features/dashboard/MembersTable';
import { CommitteesTable } from '@/components/features/dashboard/CommitteesTable';
import { debugStickyHeaders } from '@/utils/debugStickyHeaders';

export default function TestStickyHeaders() {
  useEffect(() => {
    // Import debug CSS
    import('@/styles/table-sticky-headers.css');
    
    // Run debug after a short delay to ensure DOM is ready
    setTimeout(() => {
      debugStickyHeaders();
    }, 1000);
  }, []);

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Sticky Headers Test Page</h1>
        <p className="text-muted-foreground">
          This page tests the sticky header implementation for all three tables.
          Scroll down in each table to verify headers remain fixed at the top.
        </p>
        
        <Button 
          onClick={() => debugStickyHeaders()}
          variant="outline"
        >
          Debug Sticky Headers
        </Button>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Bills Table</h2>
          <DashboardBillsTable />
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Members Table</h2>
          <MembersTable limit={100} />
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Committees Table</h2>
          <CommitteesTable limit={50} />
        </div>
      </div>
    </div>
  );
}