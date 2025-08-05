import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const LawsAdminWorking = () => {
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const testEdgeFunction = async () => {
    try {
      setProgress("Testing edge function...");
      
      const response = await supabase.functions.invoke('nys-legislation-search', {
        body: { 
          searchType: 'laws',
          query: 'test',
          limit: 1
        }
      });

      console.log("Test response:", response);
      
      if (response.error) {
        setError(`Edge function test failed: ${response.error.message}`);
      } else {
        setProgress("Edge function is working! Ready to sync.");
      }
    } catch (err: any) {
      setError(`Edge function test error: ${err.message}`);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    setProgress("Starting sync...");

    let syncError: any = null;
    
    try {
      console.log("Calling Puppeteer scraper to scrape all laws...");
      
      const response = await supabase.functions.invoke('nys-legislation-scraper', {
        body: { 
          action: 'scrape_all_laws'
        }
      });

      syncError = response.error;
      const data = response.data;

      if (syncError) {
        throw new Error(`Edge function error: ${syncError.message || JSON.stringify(syncError)}`);
      }

      if (!data?.success) {
        throw new Error(`Sync failed: ${data?.error || "Unknown error from sync function"}`);
      }

      console.log("Sync response:", data);
      setProgress(`Scraping completed! Processed ${data.results?.successful}/${data.results?.total_laws} laws`);
      
      // Refresh the page after a short delay to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 3000);

    } catch (err: any) {
      console.error("Sync error:", err);
      console.error("Full error object:", JSON.stringify(err, null, 2));
      
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
          This will scrape NY State Consolidated Laws from leginfo.state.ny.us using Puppeteer (~134 laws).
        </p>
        
        <div className="space-x-4">
          <button
            onClick={testEdgeFunction}
            disabled={syncing}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            Test Edge Function
          </button>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            {syncing ? "Scraping..." : "Scrape All Laws"}
          </button>
        </div>
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
          {syncing ? "Scraping laws..." : "Ready to scrape laws from leginfo.state.ny.us"}
        </p>
      </div>
    </div>
  );
};

export default LawsAdminWorking;