import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const LawsAdminWorking = () => {
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    setProgress("Starting sync...");

    try {
      console.log("Calling edge function to sync laws...");
      
      const { data, error: syncError } = await supabase.functions.invoke('nys-legislation-search', {
        body: { 
          action: 'sync-laws',
          sessionYear: 2025
        }
      });

      if (syncError) {
        throw new Error(`Sync failed: ${syncError.message}`);
      }

      console.log("Sync response:", data);
      setProgress("Sync completed successfully!");
      
      // Refresh the page after a short delay to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (err: any) {
      console.error("Sync error:", err);
      setError(err.message || "Failed to sync laws");
      setProgress("");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Laws Administration</h1>
      
      <div className="mb-8">
        <p className="text-gray-600 mb-4">
          This will sync NY State Consolidated Laws metadata from the Senate API (~134 laws).
        </p>
        
        <button
          onClick={handleSync}
          disabled={syncing}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded"
        >
          {syncing ? "Syncing..." : "Sync All Laws"}
        </button>
      </div>

      {progress && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-800">{progress}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}

      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">Status</h2>
        <p className="text-gray-600">
          {syncing ? "Syncing laws..." : "Ready to sync laws from NY Senate API"}
        </p>
      </div>
    </div>
  );
};

export default LawsAdminWorking;